import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/_utils/constants';
import { UserRoleEnum } from 'src/users/_utils/user-role.enum';
import { User } from 'src/users/users.schema';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    /**
     * TODO :
     *   Use roles
     **/
    const permissions = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permissions || permissions.length <= 0) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const userRoles: string[] = []; // get the role
    return permissions.some(perm => userRoles.includes(perm));
  }
}
