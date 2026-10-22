import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsBoolean, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@synteco.kz' })
  @IsEmail({}, { message: 'Укажите email' })
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString({ message: 'Пароль обязателен' })
  @MinLength(1)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@synteco.kz' })
  @IsEmail({}, { message: 'Укажите email' })
  email: string;

  @ApiProperty({ example: 'SecurePass1', description: 'Минимум 8 символов, буква и цифра' })
  @IsString({ message: 'Пароль обязателен' })
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  @MaxLength(72, { message: 'Пароль должен быть не более 72 символов' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'Пароль должен содержать хотя бы одну букву и одну цифру',
  })
  password: string;

  @ApiProperty({ example: 'Aliya' })
  @IsString({ message: 'Имя обязательно' })
  @MinLength(1, { message: 'Имя обязательно' })
  @MaxLength(100, { message: 'Имя слишком длинное' })
  firstName: string;

  @ApiProperty({ example: 'Karimova' })
  @IsString({ message: 'Фамилия обязательна' })
  @MinLength(1, { message: 'Фамилия обязательна' })
  @MaxLength(100, { message: 'Фамилия слишком длинная' })
  lastName: string;

  @ApiProperty({ example: '+77011234567', required: false })
  @IsString()
  phone?: string;

  /**
   * Согласие на обработку персональных данных (Закон РК № 94-V).
   * Обязательное и не может быть проставлено по умолчанию: закон требует
   * активного действия субъекта. Equals(true) означает, что запрос без
   * согласия будет отклонён валидацией — регистрация не состоится.
   */
  @ApiProperty({ example: true, description: 'Согласие на обработку персональных данных. Обязательно.' })
  @IsBoolean({ message: 'Требуется согласие на обработку персональных данных' })
  @Equals(true, { message: 'Для регистрации необходимо согласие на обработку персональных данных' })
  consent: boolean;

  /** Согласие на рассылку — отдельное и добровольное. */
  @ApiProperty({ example: false, required: false, description: 'Согласие на маркетинговые рассылки. Необязательно.' })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

export class RefreshDto {
  // Optional: the refresh token normally arrives via the httpOnly cookie.
  // Kept as an accepted body field for backward compatibility / non-browser clients.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class TokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  tokenType: string;
}
