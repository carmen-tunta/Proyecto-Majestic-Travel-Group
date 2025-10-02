import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private permService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JWT guard
    if (!user) return false;

    const perms = await this.permService.getUserPermissions(user.sub || user.id);
    const flat = perms.map(p => ({ mod: p.action.module.code, act: p.action.action }));

    // Construir sets por módulo
    const moduleActions: Record<string, Set<string>> = {};
    for (const p of flat) {
      if (!moduleActions[p.mod]) moduleActions[p.mod] = new Set();
      moduleActions[p.mod].add(p.act);
    }

    // 1. Validar requeridos directos
    const hasAll = required.every(r => {
      const [mod, act] = r.split(':');
      return moduleActions[mod]?.has(act);
    });
    if (!hasAll) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }

    // 2. Regla: cualquier acción distinta de VIEW exige tener VIEW del mismo módulo
    for (const r of required) {
      const [mod, act] = r.split(':');
      if (act !== 'VIEW') {
        if (!moduleActions[mod]?.has('VIEW')) {
          throw new ForbiddenException('Falta permiso de vista (VIEW) para el módulo requerido');
        }
      }
    }

    // 3. (Defensivo) Si un módulo no tiene ninguna acción asignada pero se pide algo, negar
    for (const r of required) {
      const [mod] = r.split(':');
      if (!moduleActions[mod] || moduleActions[mod].size === 0) {
        throw new ForbiddenException('Módulo sin permisos otorgados');
      }
    }

    return true;
  }
}
