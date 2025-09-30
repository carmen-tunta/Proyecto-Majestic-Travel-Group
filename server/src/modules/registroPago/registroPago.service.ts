import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RegistroPago } from "./entities/registroPago.entity";
import { Repository } from "typeorm";

@Injectable()
export class RegistroPagoService {
    constructor(
        @InjectRepository(RegistroPago)
        private readonly registroPagoRepository: Repository<RegistroPago>
    ) {}

    async create(data: Partial<RegistroPago>): Promise<RegistroPago> {
        const registroPago = this.registroPagoRepository.create(data);
        return await this.registroPagoRepository.save(registroPago);
    }

    async findAll(): Promise<RegistroPago[]> {
        return await this.registroPagoRepository.find({ relations: ['cotizacion'] });
    }

    async findByCotizacionId(id: number): Promise<RegistroPago[]> {
        return await this.registroPagoRepository.find({ where: { cotizacionId: Number(id) }, relations: ['cotizacion'] });
    }

    async update(id: number, data: Partial<RegistroPago>): Promise<RegistroPago | null> {
        const registroPago = await this.registroPagoRepository.findOne({ where: { id } });
        if (!registroPago) return null;
        this.registroPagoRepository.merge(registroPago, data);
        return await this.registroPagoRepository.save(registroPago);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.registroPagoRepository.delete(id);
        return result.affected !== 0;
    }
}