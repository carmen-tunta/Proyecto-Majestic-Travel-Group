import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    unique: true, 
    length: 50, 
    comment: 'Nombre de usuario único para login' 
  })
  username: string;

  @Column({ 
    length: 255, 
    comment: 'Contraseña hasheada del usuario' 
  })
  password: string;
}
