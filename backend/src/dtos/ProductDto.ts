import { 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min, 
  Max,
  IsArray, 
  Length,
  Matches,
  IsUrl,
  ArrayMaxSize
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Length(3, 100, { message: 'Le nom doit contenir entre 3 et 100 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @Length(10, 2000, { message: 'La description doit contenir entre 10 et 2000 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description!: string;

  @IsNotEmpty({ message: 'Le prix est requis' })
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix doit être positif' })
  @Max(10000, { message: 'Le prix ne peut pas dépasser 10000€' })
  price!: number;

  @IsNotEmpty({ message: 'La localisation est requise' })
  @IsString({ message: 'La localisation doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'La localisation doit contenir entre 2 et 100 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  location!: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @Length(5, 200, { message: 'L\'adresse doit contenir entre 5 et 200 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'La ville doit contenir entre 2 et 100 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']+$/, { message: 'La ville ne peut contenir que des lettres, espaces, tirets et apostrophes' })
  @Transform(({ value }: { value: string }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString({ message: 'Le code postal doit être une chaîne de caractères' })
  @Matches(/^\d{5}$/, { message: 'Le code postal doit être composé de 5 chiffres' })
  postalCode?: string;

  @IsOptional()
  @IsString({ message: 'La région doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'La région doit contenir entre 2 et 100 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  region?: string;

  @IsNotEmpty({ message: 'Le nombre maximum d\'invités est requis' })
  @IsNumber({}, { message: 'Le nombre maximum d\'invités doit être un nombre' })
  @Min(1, { message: 'Le nombre minimum d\'invités est 1' })
  @Max(20, { message: 'Le nombre maximum d\'invités ne peut pas dépasser 20' })
  maxGuests!: number;

  @IsOptional()
  @IsArray({ message: 'Les équipements doivent être un tableau' })
  @IsString({ each: true, message: 'Chaque équipement doit être une chaîne de caractères' })
  @ArrayMaxSize(20, { message: 'Le nombre maximum d\'équipements est 20' })
  @Transform(({ value }: { value: string[] }) => 
    value?.map((item: string) => item?.trim()).filter((item: string) => item?.length > 0)
  )
  amenities?: string[];

  @IsOptional()
  @IsArray({ message: 'Les images doivent être un tableau' })
  @IsUrl({}, { each: true, message: 'Chaque image doit être une URL valide' })
  @ArrayMaxSize(10, { message: 'Le nombre maximum d\'images est 10' })
  images?: string[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Length(3, 100, { message: 'Le nom doit contenir entre 3 et 100 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @Length(10, 2000, { message: 'La description doit contenir entre 10 et 2000 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix doit être positif' })
  @Max(10000, { message: 'Le prix ne peut pas dépasser 10000€' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'La localisation doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'La localisation doit contenir entre 2 et 100 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  location?: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @Length(5, 200, { message: 'L\'adresse doit contenir entre 5 et 200 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'La ville doit contenir entre 2 et 100 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']+$/, { message: 'La ville ne peut contenir que des lettres, espaces, tirets et apostrophes' })
  @Transform(({ value }: { value: string }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString({ message: 'Le code postal doit être une chaîne de caractères' })
  @Matches(/^\d{5}$/, { message: 'Le code postal doit être composé de 5 chiffres' })
  postalCode?: string;

  @IsOptional()
  @IsString({ message: 'La région doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'La région doit contenir entre 2 et 100 caractères' })
  @Transform(({ value }: { value: string }) => value?.trim())
  region?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le nombre maximum d\'invités doit être un nombre' })
  @Min(1, { message: 'Le nombre minimum d\'invités est 1' })
  @Max(20, { message: 'Le nombre maximum d\'invités ne peut pas dépasser 20' })
  maxGuests?: number;

  @IsOptional()
  @IsArray({ message: 'Les équipements doivent être un tableau' })
  @IsString({ each: true, message: 'Chaque équipement doit être une chaîne de caractères' })
  @ArrayMaxSize(20, { message: 'Le nombre maximum d\'équipements est 20' })
  @Transform(({ value }: { value: string[] }) => 
    value?.map((item: string) => item?.trim()).filter((item: string) => item?.length > 0)
  )
  amenities?: string[];

  @IsOptional()
  @IsArray({ message: 'Les images doivent être un tableau' })
  @IsUrl({}, { each: true, message: 'Chaque image doit être une URL valide' })
  @ArrayMaxSize(10, { message: 'Le nombre maximum d\'images est 10' })
  images?: string[];

  @IsOptional()
  isActive?: boolean;
}
