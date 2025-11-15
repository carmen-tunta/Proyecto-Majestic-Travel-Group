import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from '../users/entities/device-token.entity';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FCMService {
  private readonly logger = new Logger(FCMService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepo: Repository<DeviceToken>,
  ) {
    // Inicializar Firebase Admin si aún no está inicializado
    if (!admin.apps.length) {
      try {
        const credentialsPath = process.env.GOOGLE_NOTIFICATION_CREDENTIALS || './keys/firebase-admin-key.json';
        const serviceAccount = require(path.resolve(credentialsPath));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin inicializado correctamente');
      } catch (error) {
        this.logger.error('Error al inicializar Firebase Admin:', error);
        this.logger.error('Asegúrate de que el archivo firebase-admin-key.json existe en la carpeta keys/');
      }
    }
  }

  async saveDeviceToken(userId: number, token: string, platform: string = 'android'): Promise<void> {
    const existing = await this.deviceTokenRepo.findOne({
      where: { user: { id: userId }, token },
    });

    if (!existing) {
      const deviceToken = this.deviceTokenRepo.create({
        user: { id: userId },
        token,
        platform,
      });
      await this.deviceTokenRepo.save(deviceToken);
      this.logger.log(`Token guardado para usuario ${userId}`);
    }
  }

  async removeDeviceToken(userId: number, token: string): Promise<void> {
    await this.deviceTokenRepo.delete({
      user: { id: userId },
      token,
    });
    this.logger.log(`Token eliminado para usuario ${userId}`);
  }

  async sendNotificationToUser(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const tokens = await this.deviceTokenRepo.find({
      where: { user: { id: userId } },
    });

    if (tokens.length === 0) {
      this.logger.warn(`No hay tokens registrados para el usuario ${userId}`);
      return;
    }

    const fcmTokens = tokens.map(t => t.token);

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens: fcmTokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Notificaciones enviadas: ${response.successCount}/${fcmTokens.length}`);
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(fcmTokens[idx]);
          }
        });
        
        if (invalidTokens.length > 0) {
          for (const token of invalidTokens) {
            await this.deviceTokenRepo.delete({ token });
          }
          this.logger.log(`Tokens inválidos eliminados: ${invalidTokens.length}`);
        }
      }
    } catch (error) {
      this.logger.error('Error al enviar notificación:', error);
    }
  }

  async sendNewClientNotification(userId: number, clientName: string, requestId: number): Promise<void> {
    await this.sendNotificationToUser(
      userId,
      'Nuevo Cliente Asignado',
      `Se te ha asignado el cliente: ${clientName}`,
      {
        type: 'new_client',
        requestId: requestId.toString(),
      },
    );
  }
}
