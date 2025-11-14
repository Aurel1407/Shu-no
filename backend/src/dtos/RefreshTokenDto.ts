import { IsString, IsNotEmpty, Length } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Le refresh token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le refresh token est requis' })
  @Length(1, 255, { message: 'Le refresh token doit contenir entre 1 et 255 caractères' })
  refreshToken!: string;
}

export class RevokeTokenDto {
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le token est requis' })
  @Length(1, 255, { message: 'Le token doit contenir entre 1 et 255 caractères' })
  token!: string;
}
