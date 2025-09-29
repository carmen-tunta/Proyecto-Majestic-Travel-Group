import { IsArray, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateQuoteRequestDto {
  @IsNotEmpty()
  @IsString()
  passengerName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\+[0-9]{1,4}$/)
  countryCode: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{7,15}$/)
  whatsapp: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsArray()
  serviceIds: number[];

  @IsOptional()
  @IsString()
  countryName?: string; // Para crear cliente
}


