import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

/**
 * D-06: refresh_tokens grows forever otherwise. This purges tokens that are
 * expired, or that were revoked more than a grace period ago (kept briefly for
 * token-theft forensics / family-revocation), so the table stays small.
 */
@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger('RefreshTokenCleanup');
  private readonly REVOKED_GRACE_DAYS = 30;

  constructor(private readonly prisma: PrismaClient) {}

  @Cron('0 4 * * *') // Daily at 04:00
  async cleanup(): Promise<void> {
    try {
      const now = new Date();
      const graceCutoff = new Date(now.getTime() - this.REVOKED_GRACE_DAYS * 24 * 60 * 60 * 1000);

      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { isRevoked: true, createdAt: { lt: graceCutoff } },
          ],
        },
      });

      if (result.count > 0) {
        this.logger.log(`Purged ${result.count} expired/revoked refresh tokens`);
      }
    } catch (err: any) {
      this.logger.error(`Refresh token cleanup failed: ${err?.message ?? err}`);
    }
  }
}
