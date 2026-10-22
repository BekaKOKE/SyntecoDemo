import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';

/**
 * Refresh tokens are stored as SHA-256 hashes, never in plaintext.
 * A DB/backup leak therefore cannot be used to hijack live sessions.
 * The raw token is only ever returned to the client once.
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
import { LoginDto, RegisterDto, TokenResponseDto } from './dto/auth.dto';
import { CartService } from '../cart/cart.service';

/** Редакция политики конфиденциальности, действующая на момент сборки. */
export const PRIVACY_POLICY_VERSION = '2026-08-24';

@Injectable()
export class AuthService {
  // SEC-10: account-level lockout on repeated failures (complements the
  // per-IP throttler, which doesn't stop a distributed attack on one account).
  private readonly MAX_FAILED_ATTEMPTS = 10;
  private readonly LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 min

  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly cartService: CartService,
    @Inject(CACHE_MANAGER) private readonly cache: any,
  ) {}

  async login(dto: LoginDto, sessionId?: string, ip?: string): Promise<TokenResponseDto> {
    const failKey = `login_fail:${dto.email.toLowerCase()}`;

    if (await this.isLockedOut(failKey)) {
      await this.auditAuth('login_locked', null, dto.email, ip);
      throw new AppException(
        ErrorCode.RATE_LIMITED,
        'Слишком много неудачных попыток входа. Повторите позже.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      await this.registerFailure(failKey);
      await this.auditAuth('login_failed', null, dto.email, ip);
      throw new AppException(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      await this.registerFailure(failKey);
      await this.auditAuth('login_failed', user.id, dto.email, ip);
      throw new AppException(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
    }

    await this.clearFailures(failKey);
    await this.auditAuth('login_success', user.id, dto.email, ip);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Merge guest cart into user cart
    if (sessionId) {
      await this.cartService.mergeGuestCart(user.id, sessionId);
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto, sessionId?: string, ip?: string): Promise<TokenResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        // Доказательство согласия: закон требует не только получить его,
        // но и подтвердить факт получения.
        consentAt: new Date(),
        consentVersion: PRIVACY_POLICY_VERSION,
        consentIp: ip ?? null,
        marketingConsent: dto.marketingConsent === true,
      },
    });

    // Merge guest cart into new user cart
    if (sessionId) {
      await this.cartService.mergeGuestCart(user.id, sessionId);
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      // Token theft detection: revoke entire family
      if (stored) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: stored.familyId },
          data: { isRevoked: true },
        });
      }
      throw new AppException(ErrorCode.TOKEN_INVALID, 'Invalid refresh token');
    }

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
  }

  async logout(userId: string): Promise<void> {
    // Revoke all refresh tokens for user
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenResponseDto> {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);
    const familyId = uuid();
    const refreshTokenValue = uuid() + '-' + uuid(); // 72-char opaque token

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashToken(refreshTokenValue), // store hash, never plaintext
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
    };
  }

  /**
   * B-12: record authentication events (success/failure) with IP for security
   * monitoring. Best-effort — never let an audit write break the login flow.
   */
  private async auditAuth(
    action: 'login_success' | 'login_failed' | 'login_locked',
    userId: string | null,
    email: string,
    ip?: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: 'auth',
          entityId: email.slice(0, 50),
          action,
          userId: userId ?? undefined,
          ipAddress: ip?.slice(0, 45),
        },
      });
    } catch {
      /* swallow — auditing must not affect authentication */
    }
  }

  // ── SEC-10 lockout helpers (all fail-safe: cache errors never block login) ──

  private async isLockedOut(key: string): Promise<boolean> {
    try {
      const count = Number((await this.cache.get(key)) ?? 0);
      return count >= this.MAX_FAILED_ATTEMPTS;
    } catch {
      return false; // cache down — fall back to per-IP throttler only
    }
  }

  private async registerFailure(key: string): Promise<void> {
    try {
      const count = Number((await this.cache.get(key)) ?? 0) + 1;
      await this.cache.set(key, count, this.LOCKOUT_WINDOW_MS);
    } catch {
      /* ignore — cache unavailable */
    }
  }

  private async clearFailures(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch {
      /* ignore */
    }
  }
}
