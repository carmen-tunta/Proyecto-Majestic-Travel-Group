import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pasajero } from './entities/pasajero.entity';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';
import { UpdatePasajeroDto } from './dto/update-pasajero.dto';
import { Cotizacion } from '../cotizacion/entities/cotizacion.entity';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PasajerosService {
  constructor(
    @InjectRepository(Pasajero)
    private readonly pasajeroRepository: Repository<Pasajero>,
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepository: Repository<Cotizacion>,
  ) {}

  async create(createPasajeroDto: CreatePasajeroDto): Promise<Pasajero> {
    // Verificar que la cotización existe
    const cotizacion = await this.cotizacionRepository.findOne({ 
      where: { id: createPasajeroDto.cotizacionId } 
    });
    
    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    const pasajero = this.pasajeroRepository.create({
      ...createPasajeroDto,
      cotizacion,
    });

    return this.pasajeroRepository.save(pasajero);
  }

  async findAll(): Promise<Pasajero[]> {
    return this.pasajeroRepository.find({ 
      relations: ['cotizacion'] 
    });
  }

  async findByCotizacion(cotizacionId: number): Promise<Pasajero[]> {
    return this.pasajeroRepository.find({
      where: { cotizacion: { id: cotizacionId } },
      relations: ['cotizacion']
    });
  }

  async findOne(id: number): Promise<Pasajero> {
    const pasajero = await this.pasajeroRepository.findOne({
      where: { id },
      relations: ['cotizacion']
    });

    if (!pasajero) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    return pasajero;
  }

  async update(id: number, updatePasajeroDto: UpdatePasajeroDto): Promise<Pasajero> {
    const pasajero = await this.findOne(id);
    
    Object.assign(pasajero, updatePasajeroDto);
    
    return this.pasajeroRepository.save(pasajero);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const pasajero = await this.findOne(id);
    
    await this.pasajeroRepository.remove(pasajero);
    
    return { success: true };
  }

  async removeByCotizacion(cotizacionId: number): Promise<{ success: boolean }> {
    const pasajeros = await this.findByCotizacion(cotizacionId);
    
    if (pasajeros.length > 0) {
      // Eliminar archivos físicos antes de eliminar registros
      for (const pasajero of pasajeros) {
        if (pasajero.rutaArchivo) {
          this.deleteFile(pasajero.rutaArchivo);
        }
      }
      await this.pasajeroRepository.remove(pasajeros);
    }
    
    return { success: true };
  }

  async createWithFile(file: MulterFile, createPasajeroDto: CreatePasajeroDto): Promise<Pasajero> {
    // Verificar que la cotización existe
    const cotizacion = await this.cotizacionRepository.findOne({ 
      where: { id: createPasajeroDto.cotizacionId } 
    });
    
    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'uploads/documents-pasajeros');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const fileExt = path.extname(file.originalname);
    const timestamp = Date.now();
    const fileName = `pasajero_${createPasajeroDto.cotizacionId}_${timestamp}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo
    fs.writeFileSync(filePath, file.buffer);

    // Ruta relativa para guardar en la base de datos
    const docRoute = `documents-pasajeros/${fileName}`;

    const pasajero = this.pasajeroRepository.create({
      ...createPasajeroDto,
      cotizacion,
      rutaArchivo: docRoute,
      nombreArchivo: file.originalname,
    });

    return this.pasajeroRepository.save(pasajero);
  }

  async updateWithFile(id: number, file: MulterFile, updatePasajeroDto: UpdatePasajeroDto): Promise<Pasajero> {
    const pasajero = await this.findOne(id);

    if (file) {
      // Eliminar archivo anterior si existe
      if (pasajero.rutaArchivo) {
        this.deleteFile(pasajero.rutaArchivo);
      }

      // Crear directorio de uploads si no existe
      const uploadDir = path.join(process.cwd(), 'uploads/documents-pasajeros');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre único para el nuevo archivo
      const fileExt = path.extname(file.originalname);
      const timestamp = Date.now();
      const fileName = `pasajero_${pasajero.cotizacion.id}_${timestamp}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Guardar el nuevo archivo
      fs.writeFileSync(filePath, file.buffer);

      // Actualizar rutas
      updatePasajeroDto.rutaArchivo = `documents-pasajeros/${fileName}`;
      updatePasajeroDto.nombreArchivo = file.originalname;
    }

    Object.assign(pasajero, updatePasajeroDto);
    return this.pasajeroRepository.save(pasajero);
  }

  private deleteFile(filePath: string): void {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
    }
  }

  async removeWithFile(id: number): Promise<{ success: boolean }> {
    const pasajero = await this.findOne(id);
    
    // Eliminar archivo físico si existe
    if (pasajero.rutaArchivo) {
      this.deleteFile(pasajero.rutaArchivo);
    }
    
    await this.pasajeroRepository.remove(pasajero);
    return { success: true };
  }
}
