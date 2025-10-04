import { BadRequestException, Body, Controller, Get, Param, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { PortadaService } from "./portada.service";
import { Portada as PortadaEntity } from "../entities/portada.entity";
import { FileInterceptor } from "@nestjs/platform-express/multer/interceptors/file.interceptor";
import { File as MulterFile } from "multer";
import * as fs from 'fs';
import * as path from 'path';

const imageFileFilter = (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Solo se permiten archivos de imagen'), false);
    }
    callback(null, true);
};

// DTO para crear portada
interface CreatePortadaDto {
    titulo: string;
    serviceId: number;
    tituloIzquierda?: string;
    contenidoIzquierda?: string;
    tituloDerecha?: string;
    contenidoDerecha?: string;
    tituloDobleDerecha?: string;
    contenidoDobleDerecha?: string;
    tituloDobleIzquierda?: string;
    contenidoDobleIzquierda?: string;
}

@Controller('service-portada')
export class PortadaController {
    constructor(private readonly portadaService: PortadaService) {}

    @Get(':serviceId')
    async getPortada(@Param('serviceId') serviceId: number): Promise<PortadaEntity | null> {
        return this.portadaService.getPortadaByServiceId(serviceId);
    }

    @Post(':serviceId')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async createOrUpdateByServiceId(
        @Param('serviceId') serviceId: number,
        @Body() data: Partial<CreatePortadaDto>,
        @UploadedFile() file?: MulterFile
    ): Promise<PortadaEntity | null> {
        
        let imagenCentro = '';
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        
        if (file) {
            const uploadDir = path.join(process.cwd(), `uploads/images-portada/${serviceId}`);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Si existe una portada con imagen, eliminar la imagen anterior
            if (existingPortada?.imagenCentro) {
                const oldFilePath = path.join(process.cwd(), 'uploads', existingPortada.imagenCentro);
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
            const fileName = `${timestamp}_service${serviceId}_portada${fileExt}`;

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);

            imagenCentro = `images-portada/${serviceId}/${fileName}`;
        }

        const portadaData = {
            titulo: data.titulo,

            tituloIzquierda: data.tituloIzquierda,
            contenidoIzquierda: data.contenidoIzquierda,
            
            tituloDerecha: data.tituloDerecha,
            contenidoDerecha: data.contenidoDerecha,
            
            tituloDobleDerecha: data.tituloDobleDerecha,
            contenidoDobleDerecha: data.contenidoDobleDerecha,
            tituloDobleIzquierda: data.tituloDobleIzquierda,
            contenidoDobleIzquierda: data.contenidoDobleIzquierda,
            ...(imagenCentro && { imagenCentro })
        };

        return this.portadaService.createOrUpdatePortada(serviceId, portadaData);
    }

    createImageUrl(serviceId: number, file: MulterFile, tipo, url): string {
        const uploadDir = path.join(process.cwd(), `uploads/images-portada/${serviceId}`);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Eliminar imagen anterior si existe
        if (tipo) {
            const oldFilePath = path.join(process.cwd(), 'uploads', tipo);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (error) {
                    console.warn('Error al eliminar imagen pequeña izquierda anterior:', error);
                }
            }
        }

        // Guardar nueva imagen
        const fileExt = path.extname(file.originalname);
        const timestamp = Date.now();
        const fileName = `${timestamp}_service${serviceId}_${url}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        
        return `images-portada/${serviceId}/${fileName}`;
    }

    @Put(':serviceId/imagen-izquierda')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async updateImagenIzquierda(
        @Param('serviceId') serviceId: number,
        @UploadedFile() file: MulterFile
    ): Promise<PortadaEntity | null> {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo de imagen');
        }
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        if (!existingPortada) {
            throw new BadRequestException(`No existe una portada para el servicio con ID ${serviceId}`);
        }

        const imagenIzquierda = this.createImageUrl(serviceId, file, existingPortada.imagenIzquierda, 'izquierda');

        return this.portadaService.updatePortada(existingPortada.id.toString(), {
            imagenIzquierda
        });
    }


    @Put(':serviceId/imagen-contenido-izquierda')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async updateImagenPequeniaIzquierda(
        @Param('serviceId') serviceId: number,
        @UploadedFile() file: MulterFile
    ): Promise<PortadaEntity | null> {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo de imagen');
        }
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        if (!existingPortada) {
            throw new BadRequestException(`No existe una portada para el servicio con ID ${serviceId}`);
        }

        const imagenPequeniaIzquierda = this.createImageUrl(serviceId, file, existingPortada.imagenPequeniaIzquierda, 'izquierda_pequenia');

        return this.portadaService.updatePortada(existingPortada.id.toString(), {
            imagenPequeniaIzquierda
        });
    }

    @Put(':serviceId/imagen-derecha')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async updateImagenDerecha(
        @Param('serviceId') serviceId: number,
        @UploadedFile() file: MulterFile
    ): Promise<PortadaEntity | null> {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo de imagen');
        }
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        if (!existingPortada) {
            throw new BadRequestException(`No existe una portada para el servicio con ID ${serviceId}`);
        }

        const imagenDerecha = this.createImageUrl(serviceId, file, existingPortada.imagenDerecha, 'derecha');

        return this.portadaService.updatePortada(existingPortada.id.toString(), {
            imagenDerecha
        });
    }


    @Put(':serviceId/imagen-contenido-derecha')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async updateImagenPequeniaDerecha(
        @Param('serviceId') serviceId: number,
        @UploadedFile() file: MulterFile
    ): Promise<PortadaEntity | null> {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo de imagen');
        }
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        if (!existingPortada) {
            throw new BadRequestException(`No existe una portada para el servicio con ID ${serviceId}`);
        }

        const imagenPequeniaDerecha = this.createImageUrl(serviceId, file, existingPortada.imagenPequeniaDerecha, 'derecha_pequenia');

        return this.portadaService.updatePortada(existingPortada.id.toString(), {
            imagenPequeniaDerecha
        });
    }

    @Put(':serviceId/imagen-doble-derecha')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async updateImagenDobleDerecha(
        @Param('serviceId') serviceId: number,
        @UploadedFile() file: MulterFile
    ): Promise<PortadaEntity | null> {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo de imagen');
        }
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        if (!existingPortada) {
            throw new BadRequestException(`No existe una portada para el servicio con ID ${serviceId}`);
        }

        const imagenDobleDerecha = this.createImageUrl(serviceId, file, existingPortada.imagenDobleDerecha, 'derecha_doble');

        return this.portadaService.updatePortada(existingPortada.id.toString(), {
            imagenDobleDerecha
        });
    }

    @Put(':serviceId/imagen-doble-izquierda')
    @UseInterceptors(FileInterceptor('file', { 
        fileFilter: imageFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    async updateDobleIzquierda(
        @Param('serviceId') serviceId: number,
        @UploadedFile() file: MulterFile
    ): Promise<PortadaEntity | null> {
        if (!file) {
            throw new BadRequestException('No se proporcionó archivo de imagen');
        }
        const existingPortada = await this.portadaService.getPortadaByServiceId(serviceId);
        if (!existingPortada) {
            throw new BadRequestException(`No existe una portada para el servicio con ID ${serviceId}`);
        }

        const imagenDobleIzquierda = this.createImageUrl(serviceId, file, existingPortada.imagenDobleIzquierda, 'izquierda_doble');

        return this.portadaService.updatePortada(existingPortada.id.toString(), {
            imagenDobleIzquierda
        });
    }

}