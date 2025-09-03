import { Module } from '@nestjs/common';
import { DatabaseModule } from '../config/database.module';
import { AppController } from '../controllers/app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ComponentsModule } from './components/components.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, ComponentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
