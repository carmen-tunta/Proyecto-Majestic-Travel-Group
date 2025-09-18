import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ServiceImage } from "./entities/serviceImages.entity";
import { Repository } from "typeorm";
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ServiceImagesService {
  constructor(
    @InjectRepository(ServiceImage)
    private serviceImagesRepository: Repository<ServiceImage>
  ) {}

    create(file: MulterFile, data: Partial<ServiceImage>): Promise<ServiceImage> {
        const uploadDir = path.join(process.cwd(), 'uploads/images-service');
        const date = data?.uploadDate;
        const serviceId = data?.serviceId;
        if (!date || !serviceId) {
        throw new Error('La fecha y el id del servicio son requeridos para la imagen');
        }
        
        if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Obtener la extensión del archivo original
        const fileExt = path.extname(file.originalname);
        const dateString = typeof date === 'string' ? date : date?.toString?.() ?? '';
        const safeDateString = dateString.replace(/[\/\\:*?"<>|]/g, '-');
        const fileName = `${safeDateString}_service${serviceId}${fileExt}`;

        const filePath = path.join(uploadDir, fileName);

        // Guardar el archivo
        fs.writeFileSync(filePath, file.buffer);

        // Ruta relativa para guardar en la base de datos
        const imageRoute = `images-service/${fileName}`;
        console.log('Image saved at:', filePath);

        
        const newServiceImage = this.serviceImagesRepository.create({
            ...data,
            imagePath: imageRoute
        });
        return this.serviceImagesRepository.save(newServiceImage);
    }

    delete(id: number): Promise<{ deleted: boolean }> {
        return this.serviceImagesRepository.findOneBy({ id }).then(image => {
            if (image) {
                const filePath = path.join(process.cwd(), 'uploads', image.imagePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return this.serviceImagesRepository.delete(id).then(result => ({ deleted: !!result.affected }));
            }
            return { deleted: false };
        });
    }

    getById(id: number): Promise<ServiceImage | null> {
        return this.serviceImagesRepository.findOneBy({ id });
    }

    getByServiceId(serviceId: number): Promise<ServiceImage[]> {
        return this.serviceImagesRepository.find({
            where: { serviceId },
            order: { uploadDate: 'DESC' }
        });
    }
}