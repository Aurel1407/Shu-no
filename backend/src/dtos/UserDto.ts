import { 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  MaxLength,
  IsOptional, 
  IsBoolean, 
  IsStrongPassword,
  Length,
  Matches
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { 
    message: 'Format email invalide' 
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }, {
    message: 'Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial'
  })
  password!: string;

  @IsOptional()
  @Length(2, 50, { 
    message: 'Le prénom doit contenir entre 2 et 50 caractères' 
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']+$/, { 
    message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes' 
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @Length(2, 50, { 
    message: 'Le nom doit contenir entre 2 et 50 caractères' 
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']+$/, { 
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes' 
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  lastName?: string;
}

export class LoginUserDto {
  @IsEmail({}, { 
    message: 'Format email invalide' 
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email!: string;

  @IsNotEmpty({ 
    message: 'Le mot de passe est requis' 
  })
  password!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { 
    message: 'Format email invalide' 
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email?: string;

  @IsOptional()
  @Length(2, 50, { 
    message: 'Le prénom doit contenir entre 2 et 50 caractères' 
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']+$/, { 
    message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes' 
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @Length(2, 50, { 
    message: 'Le nom doit contenir entre 2 et 50 caractères' 
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']+$/, { 
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes' 
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsBoolean({ 
    message: 'Le statut actif doit être un booléen' 
  })
  isActive?: boolean;

  @IsOptional()
  @Matches(/^(user|admin)$/, { 
    message: 'Le rôle doit être "user" ou "admin"' 
  })
  role?: string;
}
