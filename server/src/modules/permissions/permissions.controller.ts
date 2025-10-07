import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('modules')
  async listModules() {
    let mods = await this.permissionsService.getModules(true);
    if (!mods.length) {
      await this.permissionsService.seedBase('view-only', true);
      mods = await this.permissionsService.getModules(true);
    }
    return mods;
  }

  // Endpoint manual para forzar seed si algo falló en el arranque
  @Post('seed')
  async manualSeedViewOnly() {
    await this.permissionsService.seedBase('view-only', true);
    return { ok: true, mode: 'view-only', modules: await this.permissionsService.getModules(true) };
  }

  @Post('seed/all')
  async manualSeedAll() {
    await this.permissionsService.seedBase('all', false);
    return { ok: true, mode: 'all', modules: await this.permissionsService.getModules(true) };
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async getUserPermissions(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    const isActorAdmin = await this.permissionsService.isAdmin(actorId);
    if (!isActorAdmin && actorId !== id) {
      throw new ForbiddenException('No autorizado');
    }
    return this.permissionsService.getUserPermissions(id);
  }

  @Post('user/:id/grant')
  @UseGuards(JwtAuthGuard)
  async grant(@Param('id', ParseIntPipe) id: number, @Body() dto: { actionIds: number[] }, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    const isActorAdmin = await this.permissionsService.isAdmin(actorId);
    if (!isActorAdmin) throw new ForbiddenException('Solo administradores');
    if (await this.permissionsService.isAdmin(id)) throw new ForbiddenException('No se puede modificar permisos de administradores');
    return this.permissionsService.grant(id, dto.actionIds || []);
  }

  @Post('user/:id/revoke')
  @UseGuards(JwtAuthGuard)
  async revoke(@Param('id', ParseIntPipe) id: number, @Body() dto: { actionIds: number[] }, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    const isActorAdmin = await this.permissionsService.isAdmin(actorId);
    if (!isActorAdmin) throw new ForbiddenException('Solo administradores');
    if (await this.permissionsService.isAdmin(id)) throw new ForbiddenException('No se puede modificar permisos de administradores');
    return this.permissionsService.revoke(id, dto.actionIds || []);
  }

  @Post('user/:id/grant-all')
  @UseGuards(JwtAuthGuard)
  async grantAll(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    const isActorAdmin = await this.permissionsService.isAdmin(actorId);
    if (!isActorAdmin) throw new ForbiddenException('Solo administradores');
    if (await this.permissionsService.isAdmin(id)) throw new ForbiddenException('No se puede modificar permisos de administradores');
    return this.permissionsService.grantAllToUser(id);
  }

  @Post('user/:id/grant-all-non-view')
  @UseGuards(JwtAuthGuard)
  async grantAllNonView(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    const isActorAdmin = await this.permissionsService.isAdmin(actorId);
    if (!isActorAdmin) throw new ForbiddenException('Solo administradores');
    if (await this.permissionsService.isAdmin(id)) throw new ForbiddenException('No se puede modificar permisos de administradores');
    return this.permissionsService.grantAllNonViewToUser(id);
  }

  // Nuevo endpoint: permisos del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPermissions(@Req() req: any, @Query('includeEmpty') includeEmpty?: string) {
    const userId = req.user?.sub || req.user?.id;
    const detail = await this.permissionsService.getMyPermissions(userId, includeEmpty === 'true');
    return detail; // { version, modules:[{module,nombre,acciones:[] }], flat:[] }
  }

  // Seed para política admins-only
  @UseGuards(JwtAuthGuard)
  @Post('seed/admins')
  async seedAdmins(@Req() req: any) {
    const actorId = req.user?.sub || req.user?.id;
    const isActorAdmin = await this.permissionsService.isAdmin(actorId);
    const isFixed = await this.permissionsService.isFixedAdminCandidate(actorId);
    if (!isActorAdmin && !isFixed) throw new ForbiddenException('Solo administradores');
    await this.permissionsService.seedAdminsBaseline();
    return { ok: true, mode: 'admins-only' };
  }

  // Bootstrap sin auth: sólo si no existen admins aún
  @Post('admins/bootstrap')
  async bootstrapAdmins() {
    // Si ya hay un admin, bloquear
    const hasAdmin = await this.permissionsService.anyAdminExists();
    if (hasAdmin) {
      throw new ForbiddenException('Ya existen administradores. Usar /permissions/seed/admins con un admin.');
    }
    await this.permissionsService.seedAdminsBaseline();
    return { ok: true, mode: 'admins-only', bootstrapped: true };
  }
}
