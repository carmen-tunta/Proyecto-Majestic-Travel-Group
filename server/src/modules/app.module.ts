import { Module } from '@nestjs/common';
import { DatabaseModule } from '../config/database.module';
import { AppController } from '../controllers/app.controller';
import { AppService } from './app.service';
import { PasswordRecoverController } from '../password.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
  controllers: [AppController, PasswordRecoverController],
  providers: [AppService],
})
export class AppModule {}
