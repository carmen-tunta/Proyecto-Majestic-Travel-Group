import { Module } from '@nestjs/common';
import { DatabaseModule } from '../config/database.module';
import { AppController } from '../controllers/app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
