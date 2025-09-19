import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TarifarioDocuments } from "./entities/tarifarioDocuments.entity";
import { Repository } from "typeorm";
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TarifarioDocumentsService {
  constructor(
    @InjectRepository(TarifarioDocuments)
    private tdRepository: Repository<TarifarioDocuments>
  ) {}

    create(file: MulterFile, data: Partial<TarifarioDocuments>): Promise<TarifarioDocuments> {
        const uploadDir = path.join(process.cwd(), 'uploads/documents-tarifario');
        const date = data?.uploadDate;
        const tarifarioId = data?.tarifarioId;
        if (!date || !tarifarioId) {
        throw new Error('La fecha y el id del tarifario son requeridos para la imagen');
        }
        
        if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Obtener la extensión del archivo original
        const fileExt = path.extname(file.originalname);
        const dateString = typeof date === 'string' ? date : date?.toString?.() ?? '';
        const safeDateString = dateString.replace(/[\/\\:*?"<>|]/g, '-');
        const fileName = `${safeDateString}_tarifario${tarifarioId}${fileExt}`;

        const filePath = path.join(uploadDir, fileName);

        // Guardar el archivo
        fs.writeFileSync(filePath, file.buffer);

        // Ruta relativa para guardar en la base de datos
        const docRoute = `documents-tarifario/${fileName}`;

        
        const newTarifarioDocument = this.tdRepository.create({
            ...data,
            documentPath: docRoute
        });
        return this.tdRepository.save(newTarifarioDocument);
    }

    delete(id: number): Promise<{ deleted: boolean }> {
        return this.tdRepository.findOneBy({ id }).then(doc => {
            if (doc) {
                const filePath = path.join(process.cwd(), 'uploads', doc.documentPath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return this.tdRepository.delete(id).then(result => ({ deleted: !!result.affected }));
            }
            return { deleted: false };
        });
    }

    getById(id: number): Promise<TarifarioDocuments | null> {
        return this.tdRepository.findOneBy({ id });
    }

    getByTarifarioId(tarifarioId: number): Promise<TarifarioDocuments[]> {
        return this.tdRepository.find({
            where: { tarifarioId },
            order: { uploadDate: 'DESC' }
        });
    }

    async update(id: string, data: Partial<TarifarioDocuments>, file?: MulterFile): Promise<TarifarioDocuments | null> {
        const document = await this.tdRepository.findOneBy({ id: Number(id) });
        if (!document) return null;

        let updatedFields = { ...data };

        if (file) {
            // Eliminar el archivo anterior
            const oldFilePath = path.join(process.cwd(), 'uploads', document.documentPath);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Guardar el nuevo archivo
            const uploadDir = path.join(process.cwd(), 'uploads/documents-tarifario');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileExt = path.extname(file.originalname);
            const dateString = typeof data.uploadDate === 'string' ? data.uploadDate : data.uploadDate?.toString?.() ?? '';
            const safeDateString = dateString.replace(/[\/\\:*?"<>|]/g, '-');
            const fileName = `${safeDateString}_tarifario${document.tarifarioId}${fileExt}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);

            // Actualizar la ruta del documento
            updatedFields.documentPath = `documents-tarifario/${fileName}`;
        }

        await this.tdRepository.update(id, updatedFields);
        return this.tdRepository.findOneBy({ id: Number(id) });
    }
}