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
    const flat = perms.map(p => `${p.action.module.code}:${p.action.action}`); // e.g. COTIZACION:VIEW

    const hasAll = required.every(r => flat.includes(r));
    if (!hasAll) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
    return true;
  }
}
