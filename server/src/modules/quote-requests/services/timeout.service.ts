import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { QuoteRequest } from '../entities/quote-request.entity';
import { User } from '../../users/entities/user.entity';
import { AssignmentService } from './assignment.service';
import { FCMService } from 'src/modules/notifications/fcm.service';

@Injectable()
export class TimeoutService {
  private readonly logger = new Logger(TimeoutService.name);

  constructor(
    @InjectRepository(QuoteRequest)
    private qrRepo: Repository<QuoteRequest>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private assignmentService: AssignmentService,
    private dataSource: DataSource,
    private fcmService: FCMService,
  ) {}

  /**
   * Revisar cada minuto las solicitudes que han excedido los 45 minutos
   * sin que el agente tome acción
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkExpiredAssignments() {
    try {
      // Buscar solicitudes en estado 'recibido' (asignadas pero no tomadas)
      // que fueron asignadas hace más de 45 minutos
      const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000); // 45 minutos

      const expiredRequests = await this.qrRepo.find({
        where: {
          status: 'recibido',
          // agentId: Not(IsNull()), // Solo si tiene agente asignado (debe tener agente)
          assignedAt: LessThan(fortyFiveMinutesAgo), // Usar assignedAt en lugar de createdAt
        },
        relations: ['agent'],
      });

      // Filtrar solo las que tienen agente asignado
      const requestsWithAgent = expiredRequests.filter(req => req.agentId !== null);

      if (requestsWithAgent.length === 0) {
        return;
      }

      this.logger.log(`Encontradas ${requestsWithAgent.length} solicitudes expiradas`);

      // Procesar cada solicitud expirada
      for (const request of requestsWithAgent) {
        await this.reassignExpiredRequest(request);
      }
    } catch (error) {
      this.logger.error('Error al verificar solicitudes expiradas:', error);
    }
  }

  /**
   * Reasignar una solicitud expirada al siguiente agente disponible
   */
  private async reassignExpiredRequest(request: QuoteRequest) {
    const requestId = request.id;
    const previousAgentId = request.agentId;

    if (!previousAgentId) {
      this.logger.warn(`Solicitud ${requestId} no tiene agente asignado`);
      return;
    }

    this.logger.log(
      `Reasignando solicitud ${requestId} del agente ${previousAgentId}`,
    );

    // Usar DataSource para transacción y asegurar que se guarde
    try {
      await this.dataSource.transaction(async (manager) => {
        // 1. Restar solicitud al agente anterior
        await manager
          .createQueryBuilder()
          .update('users')
          .set({
            assignedRequestsCount: () => 'GREATEST(assignedRequestsCount - 1, 0)',
            assignmentStatus: () => 'CASE WHEN assignedRequestsCount - 1 <= 0 THEN "libre" ELSE assignmentStatus END'
          })
          .where('id = :agentId', { agentId: previousAgentId })
          .execute();

        this.logger.log(`Actualizado contador del agente ${previousAgentId}`);

        // 2. Liberar la solicitud
        await manager
          .createQueryBuilder()
          .update('quote_requests')
          .set({ 
            agentId: null, 
            status: 'liberado' 
          })
          .where('id = :requestId', { requestId })
          .execute();

        this.logger.log(`Solicitud ${requestId} liberada por timeout`);

        // 3. Buscar el siguiente agente disponible (excluyendo al anterior)
        const availableAgents = await manager
          .createQueryBuilder()
          .select('user')
          .from('users', 'user')
          .orderBy('user.assignedRequestsCount', 'ASC')
          .addOrderBy('user.id', 'ASC')
          .getMany();

        if (availableAgents.length === 0) {
          this.logger.warn('No hay agentes disponibles para reasignar');
          return;
        }

        // Filtrar para excluir al agente anterior
        const otherAgents = availableAgents.filter(
          (agent: any) => agent.id !== previousAgentId
        );

        const nextAgent = otherAgents.length > 0 ? otherAgents[0] : availableAgents[0];
        
        if (nextAgent.id === previousAgentId) {
          this.logger.warn(
            `No hay otros agentes disponibles, reasignando al mismo agente ${previousAgentId}`
          );
        }

        // 4. Asignar al nuevo agente (con nueva hora de asignación)
        const updateResult = await manager
          .createQueryBuilder()
          .update('quote_requests')
          .set({ 
            agentId: nextAgent.id, 
            status: 'recibido',
            assignedAt: () => 'CURRENT_TIMESTAMP' // Reiniciar el contador de 45 minutos
          })
          .where('id = :requestId', { requestId })
          .execute();

        this.logger.log(
          `Solicitud ${requestId} actualizada en base de datos`,
        );

        // 5. Enviar notificación push al agente
      try {
        await this.fcmService.sendNewClientNotification(
          nextAgent.id,
          request.client.nombre || request.passengerName || 'Cliente',
          requestId
        );
      } catch (error) {
        console.error('Error al enviar notificación push:', error);
      }

        // 6. Actualizar contador del nuevo agente
        await manager
          .createQueryBuilder()
          .update('users')
          .set({
            assignedRequestsCount: () => 'assignedRequestsCount + 1',
            assignmentStatus: 'asignado'
          })
          .where('id = :agentId', { agentId: nextAgent.id })
          .execute();

        this.logger.log(
          `Solicitud ${requestId} reasignada exitosamente al agente ${nextAgent.id}`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Error al procesar solicitud expirada ${requestId}:`,
        error,
      );
    }
  }
}

