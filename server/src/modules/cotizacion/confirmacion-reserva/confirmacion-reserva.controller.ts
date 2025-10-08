import { BadRequestException, Body, Controller, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfirmacionReservaService } from './confirmacion-reserva.service';
import { ConfirmacionReserva as ConfirmacionReservaEntity } from '../entities/confirmacion-reserva.entity';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { RequirePermissions } from 'src/modules/auth/decorators/require-permissions.decorator';

const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new BadRequestException('Solo se permiten archivos de imagen'), false);
  }
  callback(null, true);
};

interface CreateConfirmacionDto {
  nombreCliente?: string;
  agencia?: string;
  fechaViaje?: Date;
  numeroPasajeros?: number;
  bookingPor?: string;
  whatsapp?: string;
  correo?: string;
  titulo?: string;
  estadoBooking?: string;
  direccion?: string;
  telefono?: string;
  isDeleted?: boolean;
}

@Controller('confirmacion-reserva')
export class ConfirmacionReservaController {
  constructor(private readonly confirmacionReservaService: ConfirmacionReservaService) {}

  @Get(':cotizacionId')
  @RequirePermissions('COTIZACION:VIEW')
  async getConfirmacion(@Param('cotizacionId') cotizacionId: number): Promise<ConfirmacionReservaEntity | null> {
    return this.confirmacionReservaService.getByCotizacionId(cotizacionId);
  }

  @Post(':cotizacionId')
  @RequirePermissions('COTIZACION:EDIT')
  @UseInterceptors(FileInterceptor('file', { 
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async createOrUpdateByCotizacionId(
    @Param('cotizacionId') cotizacionId: number,
    @Body() data: Partial<CreateConfirmacionDto>,
    @UploadedFile() file?: MulterFile
  ): Promise<ConfirmacionReservaEntity | null> {
    
    let imagenLogo = '';
    const existing = await this.confirmacionReservaService.getByCotizacionId(cotizacionId);
    
    if (file) {
      const uploadDir = path.join(process.cwd(), `uploads/confirmacion-reserva/${cotizacionId}`);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Eliminar imagen anterior si existe
      if (existing?.imagenLogo) {
        const oldFilePath = path.join(process.cwd(), 'uploads', existing.imagenLogo);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (error) {
            console.warn('Error al eliminar imagen anterior:', error);
          }
        }
      }

      const fileExt = path.extname(file.originalname);
      const timestamp = Date.now();
      const fileName = `${timestamp}_cotizacion${cotizacionId}_logo${fileExt}`;

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      imagenLogo = `confirmacion-reserva/${cotizacionId}/${fileName}`;
    }

    const confirmacionData = {
      nombreCliente: data.nombreCliente,
      agencia: data.agencia,
      fechaViaje: data.fechaViaje,
      numeroPasajeros: data.numeroPasajeros,
      bookingPor: data.bookingPor,
      whatsapp: data.whatsapp,
      correo: data.correo,
      titulo: data.titulo,
      estadoBooking: data.estadoBooking,
      direccion: data.direccion,
      telefono: data.telefono,
      isDeleted: data.isDeleted,
      ...(imagenLogo && { imagenLogo })
    };

    return this.confirmacionReservaService.createOrUpdate(cotizacionId, confirmacionData);
  }

  @Put(':cotizacionId/imagen-logo')
  @RequirePermissions('COTIZACION:EDIT')
  @UseInterceptors(FileInterceptor('file', { 
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async updateImagenLogo(
    @Param('cotizacionId') cotizacionId: number,
    @UploadedFile() file: MulterFile
  ): Promise<ConfirmacionReservaEntity | null> {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de imagen');
    }

    const existing = await this.confirmacionReservaService.getByCotizacionId(cotizacionId);
    if (!existing) {
      throw new BadRequestException(`No existe una confirmación de reserva para la cotización con ID ${cotizacionId}`);
    }

    const uploadDir = path.join(process.cwd(), `uploads/confirmacion-reserva/${cotizacionId}`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Eliminar imagen anterior
    if (existing.imagenLogo) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existing.imagenLogo);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (error) {
          console.warn('Error al eliminar imagen anterior:', error);
        }
      }
    }

    const fileExt = path.extname(file.originalname);
    const timestamp = Date.now();
    const fileName = `${timestamp}_cotizacion${cotizacionId}_logo${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    const imagenLogo = `confirmacion-reserva/${cotizacionId}/${fileName}`;

    return this.confirmacionReservaService.update(existing.id.toString(), {
      imagenLogo
    });
  }
}

