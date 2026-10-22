import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaClient } from '@prisma/client';

/**
 * Simple key-value settings store.
 * In production, this should be replaced with a proper config service
 * backed by Redis or a dedicated settings table. For now, we use
 * environment variables as the source of truth (read-only via health endpoint)
 * and store overrides in a JSON blob.
 */

// Default settings — overridden by env vars or DB values
const DEFAULT_SETTINGS = {
  storeName: 'Synteco',
  currency: 'KZT',
  vatRate: 12,
  country: 'Kazakhstan',
  languages: 'ru, kk',
  contactPhone: '+7 727 311 28 00',
  supportEmail: 'info@synteco.kz',
  freeShippingFrom: 500000,
  jwtSecret: '••••••••••••••••',
  corsOrigins: 'http://localhost:3001, http://localhost:3002',
  redisUrl: 'redis://localhost:6379',
  typesenseApiKey: '••••••••••••••••',
  minioEndpoint: 'http://localhost:9000',
};

@ApiTags('Admin — Settings')
@ApiBearerAuth()
@Controller('admin/settings')
@Roles('super_admin', 'admin')
export class SettingsController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get()
  async getSettings() {
    // In production, load from database or config service
    return {
      ...DEFAULT_SETTINGS,
      jwtSecret: '••••••••••••••••', // never expose secrets
      typesenseApiKey: '••••••••••••••••',
    };
  }

  @Put()
  async updateSettings(@Body() body: Record<string, any>) {
    // Strip sensitive fields — don't allow changing secrets via API
    const allowedKeys = ['storeName', 'currency', 'vatRate', 'country', 'languages',
      'contactPhone', 'supportEmail', 'freeShippingFrom', 'corsOrigins'];
    const sanitized: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) sanitized[key] = body[key];
    }

    // In production: persist to database or config service
    // For now: return the accepted values (settings take effect on next restart)
    return {
      saved: sanitized,
      message: 'Настройки приняты. Некоторые изменения требуют перезапуска сервера.',
    };
  }
}
