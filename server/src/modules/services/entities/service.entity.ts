import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { ServiceImage } from 'src/modules/serviceImages/entities/serviceImages.entity';
import { Portada } from './portada.entity';
import { ServiceComponent } from './service-component.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', comment: 'Nombre del servicio' })
  name: string;

  @Column({ type: 'text', comment: 'Ciudad del servicio' })
  city: string;

  @Column({ default: true, comment: 'Estado activo/inactivo del servicio' })
  isActive: boolean;

  @OneToMany(() => ServiceComponent, serviceComponent => serviceComponent.service, { cascade: true })
  serviceComponents: ServiceComponent[];

  // Propiedad virtual para mantener compatibilidad con código existente
  components: any[];

  @OneToMany(() => ServiceImage, image => image.service, { cascade: true })
  images: ServiceImage[];

  @OneToOne(() => Portada, portada => portada.service, { 
    cascade: true,
    nullable: true
  })
  portada: Portada;
}