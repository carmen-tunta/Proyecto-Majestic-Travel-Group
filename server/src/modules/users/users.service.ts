import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(username: string, password: string, email: string, nombre?: string, area?: string): Promise<User> {
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      email: email,
      nombre: nombre?.trim() || null,
      area: area?.trim() || null,
    });

    // Guardar en la base de datos
    const saved = await this.usersRepository.save(user);

    // Enviar contraseña generada por correo
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Bienvenido a Majestic Travel Group',
        html: `<div>Hola ${username},</div>
               <div>Tu usuario ha sido creado exitosamente.</div>
               <div>Tu contraseña inicial es: <b>${password}</b></div>
               <div>Por favor cámbiala después de iniciar sesión.</div>`
      });
    } catch (e) {
      // Loguear error pero no bloquear creación
      console.error('Error enviando correo de bienvenida:', e);
    }
    return saved;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findByResetToken(token: string) {
    return this.usersRepository.findOne({ where: { resetPasswordToken: token } });
  }

  generateRandomPassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789*!?$#';
    let pass = '';
    for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  }

  async updateStatus(id: number, status: 'activo' | 'suspendido') {
    const user = await this.findById(id);
    if (!user) return null;
    user.status = status;
    return this.save(user);
  }

  async resetToRandomPassword(id: number) {
    const user = await this.findById(id);
    if (!user) return null;
    const raw = this.generateRandomPassword();
    user.password = await bcrypt.hash(raw, 10);
    await this.save(user);
    return { userId: user.id, newPassword: raw };
  }
}
