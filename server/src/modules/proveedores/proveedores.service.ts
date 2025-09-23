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
    const newProveedor = this.proveedoresRepository.create(data);
    return this.proveedoresRepository.save(newProveedor);
  }

  async findAll(): Promise<Proveedores[]> {
    return this.proveedoresRepository.find();
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

      // Agrupar incrementos por proveedor
      const grouped = {};
      for (const row of results) {
        const provId = row['proveedor_id'];
        if (!grouped[provId]) {
          grouped[provId] = {
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
            increments: [],
          };
        }
        if (row['increment_id']) {
          grouped[provId].increments.push({
            id: row['increment_id'],
            incrementDate: row['increment_incrementDate'],
            percentage: row['increment_percentage'],
            incrementValue: row['increment_incrementValue'],
          });
        }
      }
      return Object.values(grouped);
    }


}