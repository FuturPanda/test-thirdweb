import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { THIRDWEB_AUTH_TOKEN } from "src/_utils/constants";
import { ThirdwebAuth } from "src/thirdweb/_utils/thirdweb.types";
import { UsersRepository } from "src/users/users.repository";
import { UsersService } from "src/users/users.service";
import { LoginPayload } from "thirdweb/auth";
import { GetPayloadDto } from "./_utils/dto/request/get-payload.dto";
import { LoginThirdWebDto } from "./_utils/dto/request/login.dto";
import { LoginResponseDto } from "./_utils/dto/request/response/login-response.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(THIRDWEB_AUTH_TOKEN)
    private readonly thirdwebAuth: ThirdwebAuth,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
  ) {}

  async loginWithThirdweb(
    loginDto: LoginThirdWebDto,
  ): Promise<LoginResponseDto> {
    const verifiedPayload = await this.thirdwebAuth.verifyPayload(loginDto);

    if (!verifiedPayload.valid) {
      throw new UnauthorizedException("Invalid payload");
    }

    const accessToken = await this.thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    const walletId = verifiedPayload.payload.address;
    let user = await this.usersRepository.findOneByWalletId(walletId);
    if (!user) {
      user = await this.usersRepository.createUserFromWalletId(walletId);
    }

    return { accessToken, user: await this.usersService.getUser(user) };
  }

  generateThirdwebPayload(getPayloadDto: GetPayloadDto): Promise<LoginPayload> {
    return this.thirdwebAuth.generatePayload({
      address: getPayloadDto.address,
      chainId: getPayloadDto.chainId ?? undefined,
    });
  }

  async verifyJwt(jwt: string) {
    const authResult = await this.thirdwebAuth.verifyJWT({ jwt });
    if (!authResult.valid) {
      throw new Error(`Invalid Thirdweb JWT ${authResult.error}`);
    }
    return authResult.parsedJWT;
  }
}
