import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(username: string, password: string, email: string): Promise<User> {
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      email: email,
    });

    // Guardar en la base de datos
    return await this.usersRepository.save(user);
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
}
