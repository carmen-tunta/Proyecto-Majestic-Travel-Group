import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Service } from '../../services/entities/service.entity';

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

  @ManyToOne(() => Service, (service) => service.components, { onDelete: 'CASCADE' })
  service: Service;
}