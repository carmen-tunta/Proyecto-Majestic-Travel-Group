import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: { username: string; password: string; email: string }): Promise<User> {
    return await this.usersService.create(createUserDto.username, createUserDto.password, createUserDto.email);
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
}
