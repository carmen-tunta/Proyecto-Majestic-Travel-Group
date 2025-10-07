import { SetMetadata } from '@nestjs/common';
export const PERMISSION_KEY = 'requiredPermissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);
