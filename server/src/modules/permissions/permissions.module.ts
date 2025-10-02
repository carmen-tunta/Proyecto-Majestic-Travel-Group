import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModuleEntity } from './entities/module.entity';
import { ModuleAction } from './entities/moduleAction.entity';
import { UserPermission } from './entities/userPermission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsSeed } from './permissions.seed';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppModuleEntity, ModuleAction, UserPermission, User]), UsersModule],
  providers: [PermissionsService, PermissionsSeed],
  controllers: [PermissionsController],
  exports: [PermissionsService]
})
export class PermissionsModule {}
