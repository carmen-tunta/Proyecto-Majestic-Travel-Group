import { Tarifario } from "src/modules/tarifario/entities/tarifario.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('tarifarioDocuments')
export class TarifarioDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  tarifarioId: number;

  @Column({ type: 'text', unique: true, nullable: false })
  documentPath: string;

  @Column({ type: 'text', unique: true })
  description: string;

  @Column({ type: 'text', unique: true, nullable: false })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadDate: Date;

  @ManyToOne(() => Tarifario, t => t.documents, { onDelete: 'CASCADE' })
  tarifario: Tarifario;
}