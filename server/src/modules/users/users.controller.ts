import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  async createUser(@Body() createUserDto: { username: string; password?: string; email: string; nombre?: string; area?: string }): Promise<{ user: User; rawPassword?: string }> {
    const password = createUserDto.password || this.usersService.generateRandomPassword();
    const user = await this.usersService.create(
      createUserDto.username,
      password,
      createUserDto.email,
      createUserDto.nombre,
      createUserDto.area,
    );
    return { user, rawPassword: createUserDto.password ? undefined : password };
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User | null> {
    return await this.usersService.findById(id);
  }

  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string): Promise<User | null> {
    return await this.usersService.findByUsername(username);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<User | null> {
    return await this.usersService.findByEmail(email);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: number, @Body() body: { status: 'activo' | 'suspendido' }) {
    return this.usersService.updateStatus(id, body.status);
  }

  @Post(':id/reset-password')
  async resetToRandom(@Param('id') id: number) {
    return this.usersService.resetToRandomPassword(id);
  }
}
