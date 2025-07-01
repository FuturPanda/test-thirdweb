import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRoleEnum } from './_utils/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Prop({ type: Number, default: 0 })
  oreBalance: number;

  @Prop({ type: String, default: null })
  walletId: string | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
