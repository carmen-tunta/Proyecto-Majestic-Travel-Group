import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete } from '@nestjs/common';
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
}
