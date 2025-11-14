import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @Length(2, 50, { message: 'Le prénom doit contenir entre 2 et 50 caractères' })
  firstName!: string;

  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Length(2, 50, { message: 'Le nom doit contenir entre 2 et 50 caractères' })
  lastName!: string;

  @IsNotEmpty({ message: 'L\'email est requis' })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @Length(10, 20, { message: 'Le téléphone doit contenir entre 10 et 20 caractères' })
  phone?: string;

  @IsNotEmpty({ message: 'Le sujet est requis' })
  @IsString({ message: 'Le sujet doit être une chaîne de caractères' })
  @Length(5, 100, { message: 'Le sujet doit contenir entre 5 et 100 caractères' })
  subject!: string;

  @IsNotEmpty({ message: 'Le message est requis' })
  @IsString({ message: 'Le message doit être une chaîne de caractères' })
  @Length(10, 1000, { message: 'Le message doit contenir entre 10 et 1000 caractères' })
  message!: string;
}

export class ContactResponseDto {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone?: string;
  subject!: string;
  message!: string;
  isRead!: boolean;
  createdAt!: Date;
}
