import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";
import { Repository } from "typeorm";
import { Portada } from "../entities/portada.entity";

@Injectable()
export class PortadaService {
    constructor(
        @InjectRepository(Portada)
        private portadaRepository: Repository<Portada>
    ) {}

    async getPortadaByServiceId(serviceId: number): Promise<Portada | null> {
        return this.portadaRepository.findOne({ where: { serviceId } });
    }

    async createPortada(data: Partial<Portada>): Promise<Portada> {
        const portada = this.portadaRepository.create(data);
        return this.portadaRepository.save(portada);
    }

    async createOrUpdatePortada(serviceId: number, data: Partial<Portada>): Promise<Portada |null> {
        // Verificar si ya existe una portada para este servicio
        const existingPortada = await this.getPortadaByServiceId(serviceId);
        
        if (existingPortada) {
            const filteredData = Object.keys(data).reduce((acc, key) => {
                if (data[key] !== undefined && data[key] !== null) {
                    acc[key] = data[key];
                }
                return acc;
            }, {} as any);

            // Solo actualizar si hay datos válidos
            if (Object.keys(filteredData).length > 0) {
                await this.portadaRepository.update(existingPortada.id, filteredData);
            }

            // Devolver la portada actualizada
            return this.portadaRepository.findOne({ 
                where: { id: existingPortada.id }
            });
        } else {
            // Si no existe, crear nueva
            console.log(`Creando nueva portada para servicio ${serviceId}`);
            return this.createPortada({ ...data, serviceId });
        }
    }

    async updatePortada(id: string, data: Partial<Portada>): Promise<Portada | null> {
        const numericId = Number(id);
        
        // Si data está vacío, solo buscar la portada actual
        if (!data || Object.keys(data).length === 0) {
            return this.portadaRepository.findOne({ 
                where: { id: numericId } 
            });
        }

        // Filtrar propiedades undefined antes de actualizar
        const filteredData = Object.keys(data).reduce((acc, key) => {
            if (data[key] !== undefined) {
                acc[key] = data[key];
            }
            return acc;
        }, {} as any);

        // Solo actualizar si hay datos válidos
        if (Object.keys(filteredData).length > 0) {
            await this.portadaRepository.update(numericId, filteredData);
        }

        return this.portadaRepository.findOne({ 
            where: { id: numericId },
        });
    }
}