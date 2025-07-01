import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Protect } from '../auth/_utils/decorator/protect.decorator';
import { ConnectedUser } from './_utils/decorator/connecter-user.decorator';
import { UserByIdPipe } from './_utils/user-by-id.pipe';
import { UserDocument } from './users.schema';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Protect()
  @Get('me')
  @ApiOperation({ summary: "Get the current user's information." })
  getCurrentUser(@ConnectedUser() user: UserDocument) {
    return this.usersService.getUser(user);
  }

  @Protect()
  @Get(':userId')
  @ApiParam({ type: 'string', name: 'userId' })
  @ApiOperation({ summary: "Get a user's information by its ID." })
  getUserById(@Param('userId', UserByIdPipe) user: UserDocument) {
    return this.usersService.getUser(user);
  }
}
