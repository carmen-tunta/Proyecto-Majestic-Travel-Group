import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    unique: true, 
    type: 'text', 
    comment: 'Nombre de usuario único para login' 
  })
  username: string;

  @Column({ 
    type: 'longtext',
    comment: 'Contraseña hasheada del usuario' 
  })
  password: string;

  @Column({ 
    type: 'text', 
    comment: 'Email del usuario' 
  })
  email: string;

  @Column({ nullable: true, type: 'longtext'})
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'datetime' })
  resetPasswordExpires: Date | null;
}
