import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePasajeroDto {
  @IsNotEmpty()
  @IsNumber()
  cotizacionId: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  pais: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsNotEmpty()
  @IsString()
  tipoDocumento: string;

  @IsNotEmpty()
  @IsString()
  numeroDocumento: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  @IsOptional()
  @IsString()
  descripcionDocumento?: string;

  @IsOptional()
  @IsString()
  rutaArchivo?: string;

  @IsOptional()
  @IsString()
  nombreArchivo?: string;
}
