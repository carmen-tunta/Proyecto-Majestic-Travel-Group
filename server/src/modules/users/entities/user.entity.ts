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
    type: 'text', 
    nullable: true,
    comment: 'Nombre completo del usuario'
  })
  nombre: string | null;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: 'Área a la que pertenece el usuario'
  })
  area: string | null;

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
