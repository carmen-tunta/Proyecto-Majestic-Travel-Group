import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { User } from '../modules/users/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '195.250.27.197',
      port: 3306,
      username: 'd9202_usuario',
      password: 'X94K_#ZNEOBQ%4L_',
      database: 'd9202_db1',
      /*host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,*/
      entities: [User], // Aquí se agregarán las entidades
      synchronize: true, // Cambia a true solo en desarrollo
    }),
  ],
})
export class DatabaseModule {}
