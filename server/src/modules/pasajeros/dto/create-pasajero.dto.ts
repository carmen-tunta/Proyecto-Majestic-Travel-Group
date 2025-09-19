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

  @IsNotEmpty()
  @IsString()
  descripcionDocumento: string;

  @IsOptional()
  @IsString()
  rutaArchivo?: string;

  @IsOptional()
  @IsString()
  nombreArchivo?: string;
}
