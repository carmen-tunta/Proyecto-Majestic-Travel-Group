import { BadRequestException, Body, Controller, Get, Param, Post, Put, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ConfirmacionReservaService } from './confirmacion-reserva.service';
import { ConfirmacionReserva as ConfirmacionReservaEntity } from '../entities/confirmacion-reserva.entity';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { RequirePermissions } from 'src/modules/auth/decorators/require-permissions.decorator';
import type { Response } from 'express';

const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new BadRequestException('Solo se permiten archivos de imagen'), false);
  }
  callback(null, true);
};

const pdfFileFilter = (req, file, callback) => {
  if (file.mimetype !== 'application/pdf') {
    return callback(new BadRequestException('Solo se permiten archivos PDF'), false);
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
  paginasEditables?: string;
  isDeleted?: boolean;
}

@Controller('cotizacion/:cotizacionId/confirmacion-reserva')
export class ConfirmacionReservaController {
  constructor(private readonly confirmacionReservaService: ConfirmacionReservaService) {}

  @Get()
  @RequirePermissions('COTIZACION:VIEW')
  async getConfirmacion(@Param('cotizacionId') cotizacionId: string): Promise<ConfirmacionReservaEntity | null> {
    return this.confirmacionReservaService.getByCotizacionId(Number(cotizacionId));
  }

  @Post()
  @RequirePermissions('COTIZACION:EDIT')
  @UseInterceptors(FileInterceptor('file', { 
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async createOrUpdateByCotizacionId(
    @Param('cotizacionId') cotizacionId: string,
    @Body() data: Partial<CreateConfirmacionDto>,
    @UploadedFile() file?: MulterFile
  ): Promise<ConfirmacionReservaEntity | null> {
    
    const cotizacionIdNum = Number(cotizacionId);
    
    let imagenLogo = '';
    const existing = await this.confirmacionReservaService.getByCotizacionId(cotizacionIdNum);
    
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
      paginasEditables: data.paginasEditables,
      isDeleted: data.isDeleted,
      ...(imagenLogo && { imagenLogo })
    };

    return this.confirmacionReservaService.createOrUpdate(cotizacionIdNum, confirmacionData);
  }

  @Put('imagen-logo')
  @RequirePermissions('COTIZACION:EDIT')
  @UseInterceptors(FileInterceptor('file', { 
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async updateImagenLogo(
    @Param('cotizacionId') cotizacionId: string,
    @UploadedFile() file: MulterFile
  ): Promise<ConfirmacionReservaEntity | null> {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de imagen');
    }

    const cotizacionIdNum = Number(cotizacionId);
    const existing = await this.confirmacionReservaService.getByCotizacionId(cotizacionIdNum);
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

  @Post('pdf/:cotizacionId/:usuario')
  @RequirePermissions('COTIZACION:VIEW')
  @UseInterceptors(FileInterceptor('attachmentPdf', {
    fileFilter: pdfFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async confirmacionReservaGenerarPDF(
    @Param('cotizacionId') cotizacionId: string,
    @Param('usuario') usuario: string,
    @Res() res: Response,
    @UploadedFile() attachmentPdf?: MulterFile,
  ): Promise<void> {
    const cotizacionIdNum = Number(cotizacionId);
    console.log('Generando PDF de confirmación de reserva para cotización ID:', cotizacionIdNum, 'Usuario:', usuario);
    if (Number.isNaN(cotizacionIdNum)) {
      throw new BadRequestException('El parámetro idCotizacion es inválido');
    }
    if (!usuario?.trim()) {
      throw new BadRequestException('El parámetro usuario es obligatorio');
    }
    const attachmentBuffer = attachmentPdf?.buffer;

    const pdfBuffer = await this.confirmacionReservaService.confirmacionReservaGenerarPDF(
      cotizacionIdNum,
      usuario.trim(),
      attachmentBuffer,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="confirmacion-reserva-${cotizacionIdNum}.pdf"`,
    );
    res.send(pdfBuffer);
  }
}

