import { IsOptional, IsString } from 'class-validator';

export class UpdatePasajeroDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  tipoDocumento?: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

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
