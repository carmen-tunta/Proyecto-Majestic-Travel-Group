import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private permService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JWT guard
    if (!user) return false;

    const userId = user.sub || user.id;
    if (await this.permService.isAdmin(userId)) return true;

    const perms = await this.permService.getUserPermissions(userId);
    const flat = perms
      .filter(p => p.action && p.action.module)
      .map(p => ({ mod: p.action.module.code, act: p.action.action }));

    const moduleActions: Record<string, Set<string>> = {};
    for (const p of flat) {
      if (!moduleActions[p.mod]) moduleActions[p.mod] = new Set();
      moduleActions[p.mod].add(p.act);
    }

    const hasAll = required.every(r => {
      const [mod, act] = r.split(':');
      return moduleActions[mod]?.has(act);
    });
    if (!hasAll) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }

    for (const r of required) {
      const [mod, act] = r.split(':');
      if (act !== 'VIEW') {
        if (!moduleActions[mod]?.has('VIEW')) {
          throw new ForbiddenException('Falta permiso de vista (VIEW) para el módulo requerido');
        }
      }
    }

    for (const r of required) {
      const [mod] = r.split(':');
      if (!moduleActions[mod] || moduleActions[mod].size === 0) {
        throw new ForbiddenException('Módulo sin permisos otorgados');
      }
    }

    return true;
  }
}
