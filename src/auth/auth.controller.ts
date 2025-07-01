import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './_utils/decorator/public.decorator';
import { GetPayloadDto } from './_utils/dto/request/get-payload.dto';
import { LoginThirdWebDto } from './_utils/dto/request/login.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Get Thirdweb payload for login' })
  getPayload(@Query() getPayloadDto: GetPayloadDto) {
    console.log('getPayloadDto', getPayloadDto);
    return this.authService.generateThirdwebPayload(getPayloadDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user.' })
  login(@Body() loginThirdwebDto: LoginThirdWebDto) {
    console.log('loginThirdwebDto', loginThirdwebDto);
    return this.authService.loginWithThirdweb(loginThirdwebDto);
  }
}
