import { Service } from "src/modules/services/entities/service.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('serviceImages')
export class ServiceImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'number', nullable: false })
  serviceId: number;

  @Column({ type: 'text', unique: true, nullable: false })
  imagePath: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadDate: Date;

  @ManyToOne(() => Service, service => service.images, { onDelete: 'CASCADE' })
  service: Service;
}