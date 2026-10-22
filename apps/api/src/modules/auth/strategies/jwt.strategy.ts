import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;    // user ID
  email: string;
  role: string;
}

/**
 * Секрет обязателен всегда — никакого запасного значения.
 *
 * Раньше здесь стояла строка-фоллбэк, лежащая в публичном git. Если бы на
 * сервере NODE_ENV оказался не равен ровно 'production', приложение поднялось
 * бы на общеизвестном секрете, и кто угодно подписал бы себе токен с
 * role: super_admin. Проверка NODE_ENV на проде пройдена, но полагаться на
 * значение переменной окружения в вопросах подписи токенов нельзя.
 */
function requireJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || secret.length < 16) {
    throw new Error(
      'JWT_SECRET не задан или слишком короткий. Сгенерируйте: openssl rand -hex 64',
    );
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaClient,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(config),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User inactive or not found');
    }

    return user;
  }
}
