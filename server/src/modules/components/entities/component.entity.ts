import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { TarifaComponent } from 'src/modules/tarifaComponent/entities/tarifaComponent.entity';

@Entity('components')
export class Component {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    length: 100, 
    unique: true,
    comment: 'Nombre único del componente' 
  })
  componentName: string;

  @Column({ 
    length: 50, 
    comment: 'Tipo de servicio al que pertenece el componente' 
  })
  serviceType: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Descripción detallada del componente' 
  })
  description: string;

  @CreateDateColumn({ 
    comment: 'Fecha de creación del registro' 
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    comment: 'Fecha de última actualización del registro' 
  })
  updatedAt: Date;

  @Column({ 
    default: true, 
    comment: 'Estado activo/inactivo del componente' 
  })
  isActive: boolean;

  // Relación ManyToMany: un componente puede pertenecer a muchos servicios
  @ManyToMany(() => Service, (service) => service.components)
  services: Service[];

  @OneToMany(() => TarifaComponent, tc => tc.component)
  tarifas: TarifaComponent[];
}