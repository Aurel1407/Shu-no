import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  userId!: number;

  @IsNotEmpty()
  @IsNumber()
  productId!: number;

  @IsNotEmpty()
  @IsDateString()
  checkIn!: string;

  @IsNotEmpty()
  @IsDateString()
  checkOut!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  guests!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
