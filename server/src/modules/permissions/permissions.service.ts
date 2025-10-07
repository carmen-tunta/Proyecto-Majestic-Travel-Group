import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AppModuleEntity } from './entities/app-module.entity';
import { ModuleAction } from './entities/module-action.entity';
import { UserPermission } from './entities/user-permission.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

interface SeedModuleDef { code: string; nombre: string; descripcion?: string; acciones: { action: string; label: string; descripcion?: string }[] }

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(AppModuleEntity) private modRepo: Repository<AppModuleEntity>,
    @InjectRepository(ModuleAction) private actRepo: Repository<ModuleAction>,
    @InjectRepository(UserPermission) private upRepo: Repository<UserPermission>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  private readonly logger = new Logger(PermissionsService.name);
  // Admins fijos: email, username y password
  private readonly fixedAdmins = [
    { email: 'admin@gmail.com', username: 'admin', password: 'admin' },
    { email: 'nico03vj@gmail.com', username: 'nico', password: 'nico' },
    { email: 'agustinrobolero@gmail.com', username: 'agus', password: 'agus' },
  ];

  async onModuleInit() {
    try {
      const hasAdmin = await this.anyAdminExists();
      if (!hasAdmin) {
        this.logger.log('No admins found. Seeding admins-only baseline...');
        await this.seedAdminsBaseline();
        this.logger.log('Permissions seed completed');
      } else {
        this.logger.log('Admins present. Skipping admins baseline seed');
      }
    } catch (e) {
      this.logger.error('Error during permissions seeding', e.stack || e.message);
    }
  }

  async ensureModule(def: SeedModuleDef): Promise<AppModuleEntity> {
    let mod = await this.modRepo.findOne({ where: { code: def.code } });
    if (!mod) {
      mod = this.modRepo.create({ code: def.code, nombre: def.nombre, descripcion: def.descripcion || null });
      mod = await this.modRepo.save(mod);
    }
    // Ensure actions
    const existing = await this.actRepo.find({ where: { module: { id: mod.id } }, relations: ['module'] });
    const existingMap = new Map(existing.map(a => [a.action, a]));
    for (const a of def.acciones) {
      if (!existingMap.has(a.action)) {
        const ent = this.actRepo.create({ module: mod, action: a.action, label: a.label, descripcion: a.descripcion || null });
        await this.actRepo.save(ent);
      }
    }
    return mod;
  }

  async seedBase(mode: 'all' | 'view-only' = 'view-only', resetNonView = true) {
    const modules: SeedModuleDef[] = [
      { code: 'USUARIOS', nombre: 'Usuarios', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
      { code: 'COMPONENTES', nombre: 'Componentes', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
      { code: 'SERVICIOS', nombre: 'Servicios', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
      { code: 'COTIZACION', nombre: 'Cotización', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' }, { action: 'EXPORT', label: 'Exportar' } ] },
      { code: 'ITINERARIO', nombre: 'Itinerario', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
      { code: 'PLANTILLA_ITINERARIO', nombre: 'Plantilla Itinerario', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
      { code: 'REGISTRO_PAGOS', nombre: 'Registro Pagos', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' }, { action: 'EXPORT', label: 'Exportar' } ] },
      { code: 'PROVEEDORES', nombre: 'Proveedores', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
      { code: 'REPORTES', nombre: 'Reportes', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'EXPORT', label: 'Exportar' } ] },
      { code: 'BANDEJA_SOLICITUD', nombre: 'Bandeja Solicitud', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'ASSIGN', label: 'Asignar' } ] },
      { code: 'CLIENTES', nombre: 'Clientes', acciones: [ { action: 'VIEW', label: 'Ver' }, { action: 'CREATE', label: 'Crear' }, { action: 'EDIT', label: 'Editar' }, { action: 'DELETE', label: 'Eliminar' } ] },
    ];
    for (const m of modules) {
      await this.ensureModule(m);
    }
    if (mode === 'all') await this.assignAllPermissionsToAllUsers(); else await this.assignViewPermissionsToAllUsers(resetNonView);
  }

  async assignAllPermissionsToAllUsers() {
    const users = await this.userRepo.find();
    if (!users.length) return;
    const actions = await this.actRepo.find({ relations: ['module'] });
    for (const u of users) {
      // find existing permissions
      const existing = await this.upRepo.find({ where: { user: { id: u.id } }, relations: ['action','action.module'] });
      const has = new Set(existing.map(e => e.action.id));
      const missing = actions.filter(a => !has.has(a.id));
      if (missing.length) {
        const inserts = missing.map(a => this.upRepo.create({ user: u, action: a }));
        await this.upRepo.save(inserts);
        await this.userRepo.increment({ id: u.id }, 'permissionsVersion', 1);
      }
    }
  }

  private async assignNoneToAllUsers() {
    const users = await this.userRepo.find();
    if (!users.length) return;
    const existing = await this.upRepo.find();
    if (existing.length) {
      await this.upRepo.remove(existing);
      // Incrementar versión por usuario al que se le quitaron permisos
      const byUser: Record<number, number> = {};
      for (const e of existing) byUser[e.user.id] = (byUser[e.user.id] || 0) + 1;
      await Promise.all(Object.keys(byUser).map(id => this.userRepo.increment({ id: +id }, 'permissionsVersion', 1)));
    }
  }

  private async ensureAdminUsersExist() {
    for (const a of this.fixedAdmins) {
      const email = a.email.toLowerCase();
      let user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        const hashed = await bcrypt.hash(a.password, 10);
        user = this.userRepo.create({ email, username: a.username, password: hashed, nombre: a.username, area: null, status: 'activo', isAdmin: true });
      } else {
        // Actualizar username/password y marcar admin
        user.username = a.username;
        user.password = await bcrypt.hash(a.password, 10);
        user.isAdmin = true;
      }
      await this.userRepo.save(user);
    }
  }

  private async markAdminsFlag() {
    const adminEmails = new Set(this.fixedAdmins.map(a => a.email.toLowerCase()));
  const adminUsernames = new Set(this.fixedAdmins.map(a => a.username.toLowerCase()));
    const users = await this.userRepo.find();
    for (const u of users) {
      const shouldBeAdmin = adminEmails.has((u.email || '').toLowerCase()) || adminUsernames.has((u.username || '').toLowerCase());
      if (u.isAdmin !== shouldBeAdmin) {
        u.isAdmin = shouldBeAdmin;
        await this.userRepo.save(u);
      }
    }
  }

  async seedAdminsBaseline() {
    // 1) Asegurar módulos/acciones
    await this.seedBase('all', false); // crea módulos/acciones si faltan
    // 2) Asegurar que los 3 admins existan con sus credenciales
    await this.ensureAdminUsersExist();
    // 3) Limpiar todos los permisos
    await this.assignNoneToAllUsers();
    // 4) Marcar admins según lista fija
    await this.markAdminsFlag();
    // 5) Otorgar TODO a los admins
    const actions = await this.actRepo.find();
    const admins = await this.userRepo.find({ where: { isAdmin: true } });
    for (const a of admins) {
      await this.grant(a.id, actions.map(x => x.id));
    }
  }

  async isAdmin(userId: number): Promise<boolean> {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (u?.isAdmin) return true;
    // Fallback: considerar admin si coincide con alguno de los 3 fijos por email o username
    const email = (u?.email || '').toLowerCase();
    const username = (u?.username || '').toLowerCase();
    const adminEmails = new Set(this.fixedAdmins.map(a => a.email.toLowerCase()));
    const adminUsernames = new Set(this.fixedAdmins.map(a => a.username.toLowerCase()));
    return adminEmails.has(email) || adminUsernames.has(username);
  }

  async anyAdminExists(): Promise<boolean> {
    const count = await this.userRepo.count({ where: { isAdmin: true } as any });
    return count > 0;
  }

  async isFixedAdminCandidate(userId: number): Promise<boolean> {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) return false;
    const email = (u.email || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const adminEmails = new Set(this.fixedAdmins.map(a => a.email.toLowerCase()));
    const adminUsernames = new Set(this.fixedAdmins.map(a => a.username.toLowerCase()));
    return adminEmails.has(email) || adminUsernames.has(username);
  }

  async assignViewPermissionsToAllUsers(resetNonView = false) {
    const users = await this.userRepo.find();
    if (!users.length) return;
    const viewActions = await this.actRepo.find({ where: { action: 'VIEW' }, relations: ['module'] });
    for (const u of users) {
      const existing = await this.upRepo.find({ where: { user: { id: u.id } }, relations: ['action','action.module'] });
      const existingIds = new Set(existing.map(e => e.action.id));
      const toInsert = viewActions.filter(a => !existingIds.has(a.id)).map(a => this.upRepo.create({ user: u, action: a }));
      let changed = false;
      if (toInsert.length) { await this.upRepo.save(toInsert); changed = true; }
      if (resetNonView) {
        const nonView = existing.filter(e => e.action.action !== 'VIEW');
        if (nonView.length) { await this.upRepo.remove(nonView); changed = true; }
      }
      if (changed) await this.userRepo.increment({ id: u.id }, 'permissionsVersion', 1);
    }
  }

  async grantAllNonViewToUser(userId: number) {
    const actions = await this.actRepo.find();
    const ids = actions.filter(a => a.action !== 'VIEW').map(a => a.id);
    return this.grant(userId, ids);
  }

  async getModules(includeActions = true): Promise<AppModuleEntity[]> {
    const mods = await this.modRepo.find({ relations: includeActions ? ['actions'] : [] });
    mods.sort((a,b)=> a.nombre.localeCompare(b.nombre));
    if (includeActions) {
      for (const m of mods) {
        (m.actions||[]).sort((a,b)=> a.label.localeCompare(b.label));
      }
    }
    return mods;
  }

  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    return this.upRepo.find({ where: { user: { id: userId } }, relations: ['action','action.module'] });
  }

  async grant(userId: number, actionIds: number[]) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!actionIds?.length) return { granted: 0 };
    const actions = await this.actRepo.find({ where: { id: In(actionIds) } });
    // Need action relation to compare action ids safely
    const existing = await this.upRepo.find({ where: { user: { id: userId } }, relations: ['action','action.module'] });
    const existingSet = new Set(existing.map(e => e.action.id));
    const toInsert = actions.filter(a => !existingSet.has(a.id)).map(a => this.upRepo.create({ user, action: a }));
    if (toInsert.length) {
      await this.upRepo.save(toInsert);
      await this.userRepo.increment({ id: userId }, 'permissionsVersion', 1);
    }
    return { granted: toInsert.length };
  }

  async revoke(userId: number, actionIds: number[]) {
    if (!actionIds?.length) return { revoked: 0 };
    // Load relations to access action ids
    const ups = await this.upRepo.find({ where: { user: { id: userId } }, relations: ['action','action.module'] });
    const target = ups.filter(u => actionIds.includes(u.action.id));
    if (target.length) {
      await this.upRepo.remove(target);
      await this.userRepo.increment({ id: userId }, 'permissionsVersion', 1);
    }
    return { revoked: target.length };
  }

  buildModulesWithUserFlags(modules: AppModuleEntity[], userPerms: UserPermission[]) {
    const byModule: Record<string, { module: string; nombre: string; acciones: string[] }> = {};
    for (const up of userPerms) {
      // Defensive: skip if relations not fully loaded (shouldn't happen now, but guards against inconsistent fetches)
      if (!up.action || !up.action.module) continue;
      const mod = up.action.module;
      if (!byModule[mod.code]) byModule[mod.code] = { module: mod.code, nombre: mod.nombre, acciones: [] };
      byModule[mod.code].acciones.push(up.action.action);
    }
    return modules.map(m => ({
      module: m.code,
      nombre: m.nombre,
      acciones: byModule[m.code]?.acciones || []
    }));
  }

  async getMyPermissions(userId: number, includeEmpty = true) {
    const modules = await this.getModules(true);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    // Ensure we load action + module relations so downstream code can build flat & structured representations
    const userPerms = await this.upRepo.find({ where: { user: { id: userId } }, relations: ['action','action.module'] });
    const structured = this.buildModulesWithUserFlags(modules, userPerms);
    const adminFlag = await this.isAdmin(userId);
    return { 
      version: user?.permissionsVersion || 0,
      modules: includeEmpty ? structured : structured.filter(m => m.acciones.length), 
      flat: userPerms.map(p => `${p.action.module.code}:${p.action.action}`),
      isAdmin: adminFlag,
    };
  }

  async grantAllToUser(userId: number) {
    const actions = await this.actRepo.find();
    return await this.grant(userId, actions.map(a => a.id));
  }
}
