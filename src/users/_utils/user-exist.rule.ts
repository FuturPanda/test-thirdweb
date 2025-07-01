import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
import { UsersRepository } from '../users.repository';
import { UserRoleEnum } from './user-role.enum';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(id: Types.ObjectId) {
    const user = await this.usersRepository.findOneById(id);
    return !!user;
  }

  defaultMessage = (args: ValidationArguments) =>
    `${args.property} didn't find user`;
}

export function UserExists(
  roles?: UserRoleEnum[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: roles,
      options: validationOptions,
      validator: UserExistsRule,
    });
  };
}
