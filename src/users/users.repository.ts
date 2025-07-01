import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersRepository {
  private readonly orFailNotFound = new NotFoundException('USER_NOT_FOUND');

  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  findOneById = (id: Types.ObjectId) => this.model.findById(id).exec();

  findOneByIdOrThrow = (id: Types.ObjectId) =>
    this.model.findById(id).orFail(this.orFailNotFound).exec();

  findOneByEmailOrThrow = (email: string) =>
    this.model
      .findOne({ email: email, deletedAt: null })
      .orFail(this.orFailNotFound)
      .exec();

  findOneByWalletId = (walletId: string) =>
    this.model.findOne({ walletId: walletId }).exec();

  userWithEmailExists = (email: string) =>
    this.model.exists({ email: email, deletedAt: null }).exec();

  createUserFromWalletId = (walletId: string) =>
    this.model.create({
      walletId: walletId,
    });

  updateUserById = (
    userId: Types.ObjectId,
    update: { $inc: { oreBalance: number } },
  ) => this.model.findByIdAndUpdate(userId, update, { new: true }).exec();
}
