import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { clientesContact } from './entities/contact.entity';

@Injectable()
export class ContactClientsService {
  constructor(
    @InjectRepository(clientesContact)
    private contactsRepository: Repository<clientesContact>,
  ) {}

  async create(contactData: Partial<clientesContact>): Promise<clientesContact> {
    const contact = this.contactsRepository.create(contactData);
    return await this.contactsRepository.save(contact);
  }

  async findAll(): Promise<clientesContact[]> {
    return await this.contactsRepository.find({
      relations: ['client'],
    });
  }

  async findByClientId(clientId: number): Promise<clientesContact[]> {
    return await this.contactsRepository.find({
      where: { clientId },
      relations: ['client'],
    });
  }

  async findOne(id: number): Promise<clientesContact | null> {
    return await this.contactsRepository.findOne({
      where: { id },
      relations: ['client'],
    });
  }

  async update(id: number, contactData: Partial<clientesContact>): Promise<clientesContact | null> {
    await this.contactsRepository.update(id, contactData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contactsRepository.delete(id);
  }
}
