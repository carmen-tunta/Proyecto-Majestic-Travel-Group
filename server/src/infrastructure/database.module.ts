import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '195.250.27.197',
      port: 3306,
      username: 'd9202_usuario',
      password: 'X94K_#ZNEOBQ%4L_',
      database: 'd9202_db1',
      entities: [], // Aquí se agregarán las entidades
      synchronize: false, // Cambia a true solo en desarrollo
    }),
  ],
})
export class DatabaseModule {}
