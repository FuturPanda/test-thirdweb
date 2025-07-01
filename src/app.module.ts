import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./_utils/config/env.config";
import { AppGuardProvider } from "./auth/_utils/app-guard.provider";
import { AuthModule } from "./auth/auth.module";
import { TokensModule } from "./tokens/tokens.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
    AuthModule,
    UsersModule,
    TokensModule,
  ],
  providers: [AppGuardProvider],
})
export class AppModule {}
