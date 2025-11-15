import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FCMService } from './fcm.service';
import { NotificationsController } from './notifications.controller';
import { DeviceToken } from '../users/entities/device-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken])],
  controllers: [NotificationsController],
  providers: [FCMService],
  exports: [FCMService],
})
export class NotificationsModule {}
