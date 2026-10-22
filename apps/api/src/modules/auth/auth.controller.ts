import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Req, Res, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto, TokenResponseDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// SEC-02: refresh token lives in an httpOnly cookie so JavaScript (and therefore
// any XSS) cannot read it. Scoped to the auth path with a 7-day lifetime.
const REFRESH_COOKIE = 'synteco_refresh';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: any, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: any): void {
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
}

/** Read a cookie value from the raw Cookie header (no cookie-parser dependency). */
function readCookie(req: any, name: string): string | undefined {
  const header = req.headers?.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Login with email and password. Pass X-Session-Id to merge guest cart.' })
  @ApiHeader({ name: 'X-Session-Id', required: false, description: 'Guest session ID for cart merge' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: any,
    @Ip() ip: string,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<TokenResponseDto> {
    const tokens = await this.authService.login(dto, sessionId, ip);
    setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  @ApiOperation({ summary: 'Register new account. Pass X-Session-Id to merge guest cart.' })
  @ApiHeader({ name: 'X-Session-Id', required: false, description: 'Guest session ID for cart merge' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: any,
    @Ip() ip: string,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<TokenResponseDto> {
    const tokens = await this.authService.register(dto, sessionId, ip);
    setRefreshCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 обновлений в минуту
  @ApiOperation({ summary: 'Refresh access token (refresh token from httpOnly cookie or body)' })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<TokenResponseDto> {
    // Prefer the httpOnly cookie; fall back to the body for non-browser clients.
    const token = readCookie(req, REFRESH_COOKIE) ?? dto.refreshToken;
    const tokens = await this.authService.refresh(token ?? '');
    setRefreshCookie(res, tokens.refreshToken); // rotate cookie
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke all refresh tokens' })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: any,
  ): Promise<void> {
    clearRefreshCookie(res);
    return this.authService.logout(userId);
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
