import { IsOptional, IsEnum, IsInt, IsString, IsDateString } from 'class-validator';
import type { QuoteRequestStatus } from '../entities/quote-request.entity';

export class UpdateQuoteRequestDto {
  @IsOptional()
  @IsString()
  passengerName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(['recibido', 'en_progreso', 'cotizando', 'liberado', 'sin_respuesta'])
  status?: QuoteRequestStatus;

  @IsOptional()
  @IsInt()
  agentId?: number;

  @IsOptional()
  @IsString()
  source?: string;
}
