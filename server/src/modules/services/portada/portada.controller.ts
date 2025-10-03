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
            const uploadDir = path.join(process.cwd(), 'uploads/images-portada');
            
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

            // Guardar nueva imagen
            const fileExt = path.extname(file.originalname);
            const timestamp = Date.now();
            const fileName = `${timestamp}_service${serviceId}_portada${fileExt}`;

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);

            imagenCentro = `images-portada/${fileName}`;
        }

        const portadaData = {
            titulo: data.titulo || '',
            ...(imagenCentro && { imagenCentro })
        };

        return this.portadaService.createOrUpdatePortada(serviceId, portadaData);
    }
}