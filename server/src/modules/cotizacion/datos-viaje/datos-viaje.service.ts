import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatosViaje } from "../entities/datos-viaje.entity";
import { Repository } from "typeorm";

@Injectable()
export class DatosViajeService {
    constructor(
        @InjectRepository(DatosViaje)
        private datosViajeRepository: Repository<DatosViaje>
    ) {}

    async create(data: Partial<DatosViaje>): Promise<DatosViaje> {
        const newDatosViaje = this.datosViajeRepository.create(data);
        return this.datosViajeRepository.save(newDatosViaje);
    }

    async findByCotizacionId(cotizacionId: number): Promise<DatosViaje | null> {
        return this.datosViajeRepository.findOne({ where: { cotizacionId } });
    }

    async update(cotizacionId: number, data: Partial<DatosViaje>): Promise<DatosViaje | null> { 
        const datosViaje = await this.datosViajeRepository.findOne({ where: { cotizacionId } });
        if (!datosViaje) {
            return null;
        }
        Object.assign(datosViaje, data);
        return this.datosViajeRepository.save(datosViaje);
    }
}