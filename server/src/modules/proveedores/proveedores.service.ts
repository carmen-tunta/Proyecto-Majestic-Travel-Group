import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedores } from './entities/proveedores.entity';


@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedores)
    private proveedoresRepository: Repository<Proveedores>
  ) { }

  async create(data: Partial<Proveedores>): Promise<Proveedores> {
    if (data.documentNumber !== undefined && data.documentNumber !== null) {
        const stringValue = String(data.documentNumber);
        const numValue = Number(stringValue);        
        data.documentNumber = stringValue.trim() === '' || isNaN(numValue) ? null : numValue;
    }
    const newProveedor = this.proveedoresRepository.create(data);
    return this.proveedoresRepository.save(newProveedor);
  }

  async findAll(): Promise<Proveedores[]> {
    return this.proveedoresRepository.find({ relations: ['tarifario'] });
  }

  async search(query: string): Promise<Proveedores[]> {
    if (!query || query.trim() === '') {
      return this.findAll();
    }
    return this.proveedoresRepository
      .createQueryBuilder('proveedor')
      .where('LOWER(proveedor.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(proveedor.legal) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(proveedor.serviceType) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(proveedor.city) LIKE LOWER(:query)', { query: `%${query}%` })
      .getMany();
  }

  async findById(id: string): Promise<Proveedores | null> {
    return this.proveedoresRepository.findOne({ where: { id: parseInt(id, 10) } });
  }

  async update(id: string, data: Partial<Proveedores>): Promise<Proveedores | null> {
    const proveedor = await this.proveedoresRepository.findOne({ where: { id: parseInt(id, 10) } });
    if (!proveedor) {
      return null;
    }
    Object.assign(proveedor, data);
    return this.proveedoresRepository.save(proveedor);
  }

  async findByComponentId(componentId: string): Promise<Proveedores[]> {
    return this.proveedoresRepository
      .createQueryBuilder('proveedores')
      .innerJoin('proveedores.tarifario', 'tarifario')
      .innerJoin('tarifario.components', 'tarifaComponent')
      .innerJoin('tarifaComponent.component', 'component')
      .where('component.id = :componentId', { componentId: parseInt(componentId, 10) })
      .getMany();
  }

  // Nuevo: buscar proveedores por componentId y número de pasajeros (pax)
  // async findByComponentIdAndPax(componentId: string, pax: number): Promise<any[]> {
  //   // Devuelve proveedor y el precio de la celda de intersección
  //   return this.proveedoresRepository
  //     .createQueryBuilder('proveedor')
  //     .innerJoin('proveedor.tarifario', 'tarifario')
  //     .innerJoin('tarifario.components', 'tarifaComponent')
  //     .innerJoin('tarifaComponent.component', 'component')
  //     .innerJoin('tarifario.columns', 'col')
  //     .innerJoin('tarifaComponent.prices', 'price', 'price.tarifa_column_id = col.id')
  //     .where('component.id = :componentId', { componentId: parseInt(componentId, 10) })
  //     .andWhere(':pax BETWEEN col.paxMin AND col.paxMax', { pax })
  //     .select([
  //       'proveedor.id',
  //       'proveedor.name',
  //       'proveedor.serviceType',
  //       'price.price',
  //       'col.description'
  //     ])
  //     .getRawMany();
  // }
    async findByComponentIdAndPax(componentId: string, pax: number): Promise<any[]> {
    // Devuelve proveedor, el precio de la celda de intersección y los incrementos del tarifario
    const results = await this.proveedoresRepository
      .createQueryBuilder('proveedor')
      .innerJoin('proveedor.tarifario', 'tarifario')
      .innerJoin('tarifario.components', 'tarifaComponent')
      .innerJoin('tarifaComponent.component', 'component')
      .innerJoin('tarifario.columns', 'col')
      .innerJoin('tarifaComponent.prices', 'price', 'price.tarifa_column_id = col.id')
      .leftJoin('tarifario.increments', 'increment')
      .where('component.id = :componentId', { componentId: parseInt(componentId, 10) })
      .andWhere(':pax BETWEEN col.paxMin AND col.paxMax', { pax })
      .select([
        'proveedor.id',
        'proveedor.name',
        'proveedor.legal',
        'proveedor.serviceType',
        'proveedor.city',
        'proveedor.whatsapp',
        'proveedor.mail',
        'proveedor.languages',
        'proveedor.documentType',
        'proveedor.documentNumber',
        'proveedor.direction',
        'proveedor.birthdate',
        'proveedor.gender',
        'proveedor.registrationDate',
        'col.isShared',
        'price.price',
        'col.paxMin',
        'col.paxMax',
        'col.description',
        'increment.id',
        'increment.incrementDate',
        'increment.percentage',
        'increment.incrementValue',
      ])
      .getRawMany();

    // Crear una clave única que incluya tanto el proveedor como el precio/columna
    const grouped = {};
    for (const row of results) {
      const provId = row['proveedor_id'];
      const priceId = row['price_price'];
      const colId = row['col_paxMin'] + '-' + row['col_paxMax']; // o usar otra clave única
      const uniqueKey = `${provId}_${priceId}_${colId}`;

      if (!grouped[uniqueKey]) {
        grouped[uniqueKey] = {
          proveedor: {
            id: row['proveedor_id'],
            name: row['proveedor_name'],
            legal: row['proveedor_legal'],
            serviceType: row['proveedor_serviceType'],
            city: row['proveedor_city'],
            whatsapp: row['proveedor_whatsapp'],
            mail: row['proveedor_mail'],
            languages: row['proveedor_languages'],
            documentType: row['proveedor_documentType'],
            documentNumber: row['proveedor_documentNumber'],
            direction: row['proveedor_direction'],
            birthdate: row['proveedor_birthdate'],
            gender: row['proveedor_gender'],
            registrationDate: row['proveedor_registrationDate'],
          },
          price: row['price_price'],
          paxMin: row['col_paxMin'],
          paxMax: row['col_paxMax'],
          columnDescription: row['col_description'],
          isShared: row['col_isShared'] === null || typeof row['col_isShared'] === 'undefined'
            ? true
            : !!row['col_isShared'],
          increments: [],
        };
      }
      // Agregar incremento solo si existe y no está duplicado
      if (row['increment_id']) {
        const incrementExists = grouped[uniqueKey].increments.some(
          inc => inc.id === row['increment_id']
        );
        if (!incrementExists) {
          grouped[uniqueKey].increments.push({
            id: row['increment_id'],
            incrementDate: row['increment_incrementDate'],
            percentage: row['increment_percentage'],
            incrementValue: row['increment_incrementValue'],
          });
        }
      }
    }
    return Object.values(grouped);
  }


}