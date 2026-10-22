import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenCleanupService } from './refresh-token-cleanup.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    PassportModule,
    CartModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || (process.env.NODE_ENV === 'production'
          ? (() => { throw new Error('JWT_SECRET environment variable is required in production'); })()
          : 'synteco-dev-secret'),
        signOptions: {
          expiresIn: '15m',          // Short-lived access token
          issuer: 'synteco.kz',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenCleanupService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
