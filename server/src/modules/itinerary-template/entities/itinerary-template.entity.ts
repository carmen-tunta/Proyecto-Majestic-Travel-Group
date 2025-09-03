import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('itineraryTemplate')
export class ItineraryTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    length: 50, 
    comment: 'Nombre de plantilla' 
  })
  templateTitle: string;

  @Column({ 
    length: 50, 
    comment: 'Nombre del itinerario' 
  })
  itineraryTitle: string;
}
