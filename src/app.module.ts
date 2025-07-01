import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { EnvironmentVariables, validateEnv } from "./_utils/config/env.config";
import { AppGuardProvider } from "./auth/_utils/app-guard.provider";
import { AuthModule } from "./auth/auth.module";
import { TokensModule } from "./tokens/tokens.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        uri: configService.get("DATABASE").DATABASE_URL,
        dbName: configService.get("DATABASE").DATABASE_NAME,
      }),
    }),
    ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
    AuthModule,
    UsersModule,
    TokensModule,
  ],
  providers: [AppGuardProvider],
})
export class AppModule {}
