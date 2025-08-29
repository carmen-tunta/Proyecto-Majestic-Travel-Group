import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../modules/app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppRoutesModule {}
