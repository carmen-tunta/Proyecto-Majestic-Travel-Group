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

  @Column({ 
    type: 'longtext', 
    comment: 'Descripción de la plantilla itineraria' 
  })
  description: string;
}
