import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { TokensService } from "src/tokens/tokens.service";
import { UsersMapper } from "./users.mapper";
import { UsersRepository } from "./users.repository";
import { UserDocument } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersMapper: UsersMapper,
    private readonly tokensService: TokensService,
  ) {}

  async getUser(user: UserDocument) {
    const oreBalance = await this.tokensService.getUserOreBalance(user);
    return this.usersMapper.toGetUserDto(user, oreBalance);
  }

  manageOreBalance = async (userId: Types.ObjectId, amount: number) => {
    const user = await this.usersRepository.findOneByIdOrThrow(userId);

    if (user.oreBalance - amount < 0) {
      throw new BadRequestException("INSUFFICIENT_ORE_BALANCE");
    }

    return this.usersRepository.updateUserById(userId, {
      $inc: { oreBalance: amount },
    });
  };
}
