import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ROLES_KEY } from 'src/_utils/constants';
import { UserRoleEnum } from 'src/users/_utils/user-role.enum';
import { RoleGuard } from '../guard/role.guard';
import { ProtectedAutoRolesDecorator } from './protected-auto-roles.decorator';

export function Protect(...roles: UserRoleEnum[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiBearerAuth(),
    UseGuards(RoleGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ProtectedAutoRolesDecorator(...roles),
  );
}
