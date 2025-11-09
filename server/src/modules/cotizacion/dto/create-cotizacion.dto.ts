import { IsNotEmpty, IsString, IsEnum, IsNumber, IsDateString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateCotizacionDto {
  @IsNotEmpty()
  @IsNumber()
  clienteId: number;

  @IsOptional()
  @IsString()
  nombreCotizacion?: string;

  @IsNotEmpty()
  @IsEnum(['Privado', 'Compartido', 'Priv', 'Privado/compartido'])
  categoria: string;

  @IsNotEmpty()
  @IsNumber()
  utilidad: number;

  @IsNotEmpty()
  @IsString()
  codigoReserva: string;

  @IsNotEmpty()
  @IsDateString()
  fechaViaje: string;

  @IsOptional()
  @IsDateString()
  fechaLlegada?: string;

  @IsOptional()
  @IsDateString()
  fechaSalida?: string;

  @IsNotEmpty()
  @IsEnum(['Iniciado', 'Proceso', 'Finalizado'])
  estado: string;

  @IsNotEmpty()
  @IsEnum(['Viator', 'Civitatis', 'GetYourGuide', 'TourRadar', 'TripAdvisor', 'Peru Hop', 'Inca Rail', 'PeruRail', 'Lima Tours', 'Condor Travel'])
  agencia: string;

  @IsNotEmpty()
  @IsEnum(['Perú', 'Bolivia', 'Chile', 'Argentina', 'Brasil', 'Ecuador', 'Colombia', 'España', 'Estados Unidos', 'Francia'])
  pais: string;

  @IsNotEmpty()
  @IsEnum(['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano'])
  idioma: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  nroPax: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  nroAdultos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  nroNinos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  nroBebes?: number;

  @IsOptional()
  @IsString()
  lugarRecojo?: string;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsNotEmpty()
  @IsInt()
  anio: number;

  @IsOptional()
  @IsInt()
  numeroFile?: number;

  @IsOptional()
  @IsInt()
  costo?: number;

  @IsOptional()
  @IsInt()
  precioUtilidad?: number;

  @IsOptional()
  @IsInt()
  precioVenta?: number;
  
  @IsOptional()
  @IsInt()
  adelanto?: number;

  @IsOptional()
  @IsInt()
  saldo?: number;
}
