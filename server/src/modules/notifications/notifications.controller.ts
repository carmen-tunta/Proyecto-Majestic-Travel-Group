import { Controller, Post, Delete, Body, Request, UseGuards } from '@nestjs/common';
import { FCMService } from './fcm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly fcmService: FCMService) {}

  @Post('register-token')
  async registerToken(
    @Request() req,
    @Body('token') token: string,
    @Body('platform') platform: string = 'android',
  ) {
    await this.fcmService.saveDeviceToken(req.user.id, token, platform);
    return { message: 'Token registrado correctamente' };
  }

  @Delete('unregister-token')
  async unregisterToken(
    @Request() req,
    @Body('token') token: string,
  ) {
    await this.fcmService.removeDeviceToken(req.user.id, token);
    return { message: 'Token eliminado correctamente' };
  }

  @Post('send-test')
    async sendTestNotification(
    @Body() body: { userId: number; clientName: string; clientId: number }
    ) {
    await this.fcmService.sendNewClientNotification(
        body.userId,
        body.clientName,
        body.clientId,
    );
    return { message: 'Notificación enviada' };
    }
}
