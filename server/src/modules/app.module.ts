import { Module } from '@nestjs/common';
import { DatabaseModule } from '../config/database.module';
import { AppController } from '../controllers/app.controller';
import { AppService } from './app.service';
import { PasswordRecoverController } from '../password.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, PasswordRecoverController],
  providers: [AppService],
})
export class AppModule {}
