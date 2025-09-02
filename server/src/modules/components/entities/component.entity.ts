import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('components')
export class Component {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    length: 100, 
    comment: 'Nombre del componente' 
  })
  componentName: string;

  @Column({ 
    length: 50, 
    comment: 'Tipo de servicio que ofrece el componente' 
  })
  serviceType: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Descripción detallada del componente' 
  })
  description: string;
}