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

  @Column({ 
    length: 150, 
    comment: 'Email del usuario' 
  })
  email: string;

  @Column({ nullable: true, type: 'varchar'})
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'datetime' })
  resetPasswordExpires: Date | null;
}
