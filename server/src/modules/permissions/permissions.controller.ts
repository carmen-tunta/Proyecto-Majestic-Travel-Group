import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('modules')
  listModules() {
    return this.permissionsService.listModulesWithActions();
  }

  @Get('user/:id')
  getUserPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.getUserPermissions(id);
  }

  @Post('user/:id/grant')
  grant(@Param('id', ParseIntPipe) id: number, @Body() dto: { actionIds: number[] }) {
    return this.permissionsService.grantPermissions(id, dto.actionIds || []);
  }

  @Post('user/:id/revoke')
  revoke(@Param('id', ParseIntPipe) id: number, @Body() dto: { actionIds: number[] }) {
    return this.permissionsService.revokePermissions(id, dto.actionIds || []);
  }

  // Nuevo endpoint: permisos del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPermissions(@Req() req: any, @Query('includeEmpty') includeEmpty?: string) {
    const userId = req.user?.sub || req.user?.id;
    const raw = await this.permissionsService.getUserPermissions(userId);
    const byModule: Record<string, { module: string; actions: string[] } > = {};
    for (const p of raw) {
      const modCode = p.action.module.code;
      if (!byModule[modCode]) byModule[modCode] = { module: modCode, actions: [] };
      byModule[modCode].actions.push(p.action.action);
    }
    if (includeEmpty === 'true') {
      const allMods = await this.permissionsService.listModulesWithActions();
      for (const m of allMods) {
        if (!byModule[m.code]) byModule[m.code] = { module: m.code, actions: [] };
      }
    }
    // Obtener versión de permisos del usuario
    const version = (await this.permissionsService['userRepo'].findOne({ where: { id: userId } }))?.permissionsVersion || 0;
    return { modules: Object.values(byModule), version };
  }
}
