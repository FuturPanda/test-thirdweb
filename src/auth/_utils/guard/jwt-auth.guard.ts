import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/_utils/constants';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('NO_BEARER_TOKEN');

    try {
      const jwt = await this.authService.verifyJwt(token);
      const walletAddress = jwt.sub;

      const user = await this.usersRepository.findOneByWalletId(walletAddress);
      if (!user) throw new UnauthorizedException('USER_NOT_FOUND');
      request.user = user;

      return !!jwt;
    } catch (error) {
      throw new UnauthorizedException(
        `Error during token verification: ${error.message}`,
      );
    }
  }
}
