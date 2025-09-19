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
  descripcionDocumento?: string;

  @IsOptional()
  @IsString()
  rutaArchivo?: string;

  @IsOptional()
  @IsString()
  nombreArchivo?: string;
}
