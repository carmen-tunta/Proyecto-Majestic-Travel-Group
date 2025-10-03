import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AppModuleEntity } from './entities/module.entity';
import { ModuleAction } from './entities/moduleAction.entity';
import { UserPermission } from './entities/userPermission.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(AppModuleEntity) private moduleRepo: Repository<AppModuleEntity>,
    @InjectRepository(ModuleAction) private actionRepo: Repository<ModuleAction>,
    @InjectRepository(UserPermission) private userPermRepo: Repository<UserPermission>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async listModulesWithActions() {
    return this.moduleRepo.find({ relations: ['actions'] });
  }

  async ensureModule(code: string, name: string, description?: string) {
    let mod = await this.moduleRepo.findOne({ where: { code } });
    if (!mod) {
      mod = this.moduleRepo.create({ code, name, description: description || null });
      mod = await this.moduleRepo.save(mod);
    }
    return mod;
  }

  async ensureAction(moduleCode: string, action: string, label: string, description?: string) {
    const mod = await this.ensureModule(moduleCode, moduleCode, undefined);
    let act = await this.actionRepo.findOne({ where: { module: { id: mod.id }, action }, relations: ['module'] });
    if (!act) {
      act = this.actionRepo.create({ module: mod, action, label, description: description || null });
      act = await this.actionRepo.save(act);
    }
    return act;
  }

  async grantPermissions(userId: number, actionIds: number[]) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const actions = await this.actionRepo.find({ where: { id: In(actionIds) } });
    const existing = await this.userPermRepo.find({ where: { user: { id: userId } }, relations: ['action'] });

    const existingActionIds = new Set(existing.map(e => e.action.id));
    const toInsert = actions.filter(a => !existingActionIds.has(a.id));

    if (toInsert.length) {
      await this.userPermRepo.save(toInsert.map(a => this.userPermRepo.create({ user, action: a })));
      // Incrementar versión de permisos del usuario
      await this.userRepo.update(userId, { permissionsVersion: () => 'permissionsVersion + 1' });
    }

    return this.userPermRepo.find({ where: { user: { id: userId } }, relations: ['action', 'action.module'] });
  }

  async revokePermissions(userId: number, actionIds: number[]) {
    const perms = await this.userPermRepo.find({ where: { user: { id: userId } }, relations: ['action'] });
    const toRemove = perms.filter(p => actionIds.includes(p.action.id));
    if (toRemove.length) {
      await this.userPermRepo.remove(toRemove);
      await this.userRepo.update(userId, { permissionsVersion: () => 'permissionsVersion + 1' });
    }
    return { removed: toRemove.length };
  }

  async getUserPermissions(userId: number) {
    return this.userPermRepo.find({ where: { user: { id: userId } }, relations: ['action', 'action.module'] });
  }
}
