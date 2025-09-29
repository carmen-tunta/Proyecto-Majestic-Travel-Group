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

    async findById(id: number): Promise<RegistroPago | null> {
        return await this.registroPagoRepository.findOne({ where: { id }, relations: ['cotizacion'] });
    } 

    async update(id: number, data: Partial<RegistroPago>): Promise<RegistroPago | null> {
        await this.registroPagoRepository.update(id, data);
        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.registroPagoRepository.delete(id);
        return result.affected !== 0;
    }
}