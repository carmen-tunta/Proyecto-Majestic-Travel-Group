import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QuoteRequest } from '../entities/quote-request.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(QuoteRequest)
    private qrRepo: Repository<QuoteRequest>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Asigna una solicitud al agente con menor carga (round-robin)
   */
  async assignRequestToAgent(requestId: number): Promise<QuoteRequest> {
    // 1. Verificar que la solicitud existe
    const request = await this.qrRepo.findOne({
      where: { id: requestId },
      relations: ['client', 'services', 'services.service']
    });

    if (!request) {
      throw new NotFoundException(`QuoteRequest with ID ${requestId} not found`);
    }

    // 2. Verificar que no esté ya asignada
    if (request.agentId) {
      throw new Error('La solicitud ya está asignada a un agente');
    }

    // 3. Buscar el agente con menor cantidad de solicitudes asignadas
    const availableAgents = await this.usersRepo.find({
      order: {
        assignedRequestsCount: 'ASC',
        id: 'ASC' // En caso de empate, usar el ID más bajo
      }
    });

    if (availableAgents.length === 0) {
      throw new Error('No hay agentes disponibles');
    }

    // 4. Asignar al primer agente (menor carga)
    const assignedAgent = availableAgents[0];

    // 5. Actualizar la solicitud
    request.agentId = assignedAgent.id;
    request.status = 'en_progreso';

    // 6. Actualizar el contador del agente
    assignedAgent.assignedRequestsCount += 1;
    assignedAgent.assignmentStatus = 'asignado';

    // 7. Guardar cambios
    await this.usersRepo.save(assignedAgent);
    await this.qrRepo.save(request);

    // 8. Retornar la solicitud actualizada
    const updatedRequest = await this.qrRepo.findOne({
      where: { id: requestId },
      relations: ['client', 'services', 'services.service']
    });
    
    if (!updatedRequest) {
      throw new NotFoundException(`QuoteRequest with ID ${requestId} not found after update`);
    }
    
    return updatedRequest;
  }

  /**
   * Libera una solicitud (el agente la libera para que otro la tome)
   */
  async releaseRequest(requestId: number, agentId: number): Promise<QuoteRequest> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Verificar y actualizar la solicitud en una sola consulta
      const updateResult = await manager
        .createQueryBuilder()
        .update(QuoteRequest)
        .set({ 
          agentId: null, 
          status: 'recibido' 
        })
        .where('id = :requestId AND agentId = :agentId', { requestId, agentId })
        .execute();

      if (updateResult.affected === 0) {
        throw new NotFoundException(`QuoteRequest with ID ${requestId} not found or not assigned to agent ${agentId}`);
      }

      // 2. Actualizar contador del agente en una sola consulta
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          assignedRequestsCount: () => 'GREATEST(assignedRequestsCount - 1, 0)',
          assignmentStatus: () => 'CASE WHEN assignedRequestsCount - 1 <= 0 THEN "libre" ELSE assignmentStatus END'
        })
        .where('id = :agentId', { agentId })
        .execute();

      // 3. Retornar la solicitud actualizada (solo si es necesario)
      const updatedRequest = await manager.findOne(QuoteRequest, {
        where: { id: requestId },
        relations: ['client', 'services', 'services.service', 'agent']
      });
      
      if (!updatedRequest) {
        throw new NotFoundException(`QuoteRequest with ID ${requestId} not found after release`);
      }
      
      return updatedRequest;
    });
  }

  /**
   * Marca una solicitud como cotizando (reduce contador del agente)
   */
  async markAsQuoting(requestId: number, agentId: number): Promise<QuoteRequest> {
    return this.updateRequestStatus(requestId, agentId, 'cotizando');
  }

  /**
   * Marca una solicitud como sin respuesta (reduce contador del agente)
   */
  async markAsNoResponse(requestId: number, agentId: number): Promise<QuoteRequest> {
    return this.updateRequestStatus(requestId, agentId, 'sin_respuesta');
  }

  /**
   * Método privado para actualizar estado y reducir contador
   */
  private async updateRequestStatus(requestId: number, agentId: number, status: 'cotizando' | 'sin_respuesta'): Promise<QuoteRequest> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Verificar y actualizar la solicitud en una sola consulta
      const updateResult = await manager
        .createQueryBuilder()
        .update(QuoteRequest)
        .set({ status })
        .where('id = :requestId AND agentId = :agentId', { requestId, agentId })
        .execute();

      if (updateResult.affected === 0) {
        throw new NotFoundException(`QuoteRequest with ID ${requestId} not found or not assigned to agent ${agentId}`);
      }

      // 2. Actualizar contador del agente en una sola consulta
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          assignedRequestsCount: () => 'GREATEST(assignedRequestsCount - 1, 0)',
          assignmentStatus: () => 'CASE WHEN assignedRequestsCount - 1 <= 0 THEN "libre" ELSE assignmentStatus END'
        })
        .where('id = :agentId', { agentId })
        .execute();

      // 3. Retornar la solicitud actualizada (solo si es necesario)
      const updatedRequest = await manager.findOne(QuoteRequest, {
        where: { id: requestId },
        relations: ['client', 'services', 'services.service', 'agent']
      });
      
      if (!updatedRequest) {
        throw new NotFoundException(`QuoteRequest with ID ${requestId} not found after status update`);
      }
      
      return updatedRequest;
    });
  }

  /**
   * Obtiene el estado de asignación de todos los agentes
   */
  async getAgentsAssignmentStatus(): Promise<User[]> {
    return this.usersRepo.find({
      select: ['id', 'username', 'nombre', 'assignmentStatus', 'assignedRequestsCount'],
      order: {
        assignedRequestsCount: 'ASC',
        id: 'ASC'
      }
    });
  }

  /**
   * Permite a un agente tomar una solicitud liberada
   */
  async takeRequest(requestId: number, agentId: number): Promise<QuoteRequest> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Verificar que la solicitud existe y no está asignada
      const request = await manager.findOne(QuoteRequest, {
        where: { id: requestId }
      });

      if (!request) {
        throw new NotFoundException(`QuoteRequest with ID ${requestId} not found`);
      }

      if (request.agentId) {
        throw new Error('La solicitud ya está asignada a otro agente');
      }

      // 2. Buscar el agente
      const agent = await manager.findOne(User, { where: { id: agentId } });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${agentId} not found`);
      }

      // 3. Asignar la solicitud al agente en una sola consulta
      const updateResult = await manager
        .createQueryBuilder()
        .update(QuoteRequest)
        .set({ 
          agentId: agentId, 
          status: 'en_progreso' 
        })
        .where('id = :requestId AND agentId IS NULL', { requestId })
        .execute();

      if (updateResult.affected === 0) {
        throw new Error('La solicitud ya está asignada a otro agente o no existe');
      }

      // 4. Actualizar contador del agente en una sola consulta
      await manager
        .createQueryBuilder()
        .update(User)
        .set({
          assignedRequestsCount: () => 'assignedRequestsCount + 1',
          assignmentStatus: () => '"asignado"'
        })
        .where('id = :agentId', { agentId })
        .execute();

      // 5. Retornar la solicitud actualizada
      const updatedRequest = await manager.findOne(QuoteRequest, {
        where: { id: requestId },
        relations: ['client', 'services', 'services.service', 'agent']
      });
      
      if (!updatedRequest) {
        throw new NotFoundException(`QuoteRequest with ID ${requestId} not found after take`);
      }
      
      return updatedRequest;
    });
  }
}
