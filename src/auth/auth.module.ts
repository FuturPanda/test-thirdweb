import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, PassportModule, ThirdwebModule],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
