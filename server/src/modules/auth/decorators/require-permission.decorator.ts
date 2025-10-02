import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermissions';
export function RequirePermissions(...permissions: string[]) {
  return SetMetadata(PERMISSION_KEY, permissions);
}
