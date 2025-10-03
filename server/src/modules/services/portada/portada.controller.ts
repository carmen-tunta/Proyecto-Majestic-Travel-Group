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

    // @Post()
    // @UseInterceptors(FileInterceptor('file', { 
    //     fileFilter: imageFileFilter,
    //     limits: { fileSize: 10 * 1024 * 1024 }
    // }))
    // async createPortada(
    //     @Body() data: CreatePortadaDto,
    //     @UploadedFile() file?: MulterFile
    // ): Promise<PortadaEntity> {
        
    //     let imagenCentro = '';
        
    //     // Si se subió una imagen, procesarla usando la misma lógica
    //     if (file) {
    //         const uploadDir = path.join(process.cwd(), 'uploads/images-portada');
    //         const serviceId = data.serviceId;
            
    //         // Crear directorio si no existe
    //         if (!fs.existsSync(uploadDir)) {
    //             fs.mkdirSync(uploadDir, { recursive: true });
    //         }

    //         // Obtener la extensión del archivo original
    //         const fileExt = path.extname(file.originalname);
    //         const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    //         const safeDateString = currentDate.replace(/[\/\\:*?"<>|]/g, '-');
    //         const fileName = `${safeDateString}_service${serviceId}_portada${fileExt}`;

    //         const filePath = path.join(uploadDir, fileName);

    //         // Guardar el archivo
    //         fs.writeFileSync(filePath, file.buffer);

    //         // Ruta relativa para guardar en la base de datos
    //         imagenCentro = `images-portada/${fileName}`;
    //         console.log('Portada image saved at:', filePath);
    //     }

    //     const portadaData = {
    //         titulo: data.titulo ? data.titulo : undefined,
    //         imagenCentro,
    //         serviceId: data.serviceId
    //     };

    //     return this.portadaService.createPortada(portadaData);
    // }

    // @Put(':id')
    // @UseInterceptors(FileInterceptor('file', { 
    //     fileFilter: imageFileFilter,
    //     limits: { fileSize: 10 * 1024 * 1024 }
    // }))
    // async updatePortada(
    //     @Param('id') id: string, 
    //     @Body() data: Partial<CreatePortadaDto>,
    //     @UploadedFile() file?: MulterFile
    // ): Promise<PortadaEntity | null> {
        
    //     const updateData: any = { ...data };
        
    //     // Solo actualizar imagen si se subió una nueva
    //     if (file) {
    //         const uploadDir = path.join(process.cwd(), 'uploads/images-portada');
            
    //         // Crear directorio si no existe
    //         if (!fs.existsSync(uploadDir)) {
    //             fs.mkdirSync(uploadDir, { recursive: true });
    //         }

    //         // Obtener la portada actual para eliminar la imagen anterior si existe
    //         const currentPortada = await this.portadaService.updatePortada(id, {});
    //         if (currentPortada?.imagenCentro) {
    //             const oldFilePath = path.join(process.cwd(), 'uploads', currentPortada.imagenCentro);
    //             if (fs.existsSync(oldFilePath)) {
    //                 fs.unlinkSync(oldFilePath); // Eliminar imagen anterior
    //             }
    //         }

    //         // Guardar nueva imagen
    //         const fileExt = path.extname(file.originalname);
    //         const currentDate = new Date().toISOString().split('T')[0];
    //         const safeDateString = currentDate.replace(/[\/\\:*?"<>|]/g, '-');
    //         const fileName = `${safeDateString}_portada${id}_updated${fileExt}`;

    //         const filePath = path.join(uploadDir, fileName);
    //         fs.writeFileSync(filePath, file.buffer);

    //         updateData.imagenCentro = `images-portada/${fileName}`;
    //         console.log('Updated portada image saved at:', filePath);
    //     }

    //     return this.portadaService.updatePortada(id, updateData);
    // }

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
                        console.log('Imagen anterior eliminada:', oldFilePath);
                    } catch (error) {
                        console.warn('Error al eliminar imagen anterior:', error);
                    }
                }
            }

            // Guardar nueva imagen
            const fileExt = path.extname(file.originalname);
            const currentDate = new Date().toISOString().split('T')[0];
            const safeDateString = currentDate.replace(/[\/\\:*?"<>|]/g, '-');
            const fileName = `${safeDateString}_service${serviceId}_portada${fileExt}`;

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);

            imagenCentro = `images-portada/${fileName}`;
            console.log('Nueva imagen guardada:', filePath);
        }

        const portadaData = {
            titulo: data.titulo || '',
            ...(imagenCentro && { imagenCentro })
        };

        return this.portadaService.createOrUpdatePortada(serviceId, portadaData);
    }
}