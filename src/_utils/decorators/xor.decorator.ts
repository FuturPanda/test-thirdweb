import {
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { isNil } from 'lodash';

@ValidatorConstraint({ name: 'xorConstraint', async: false })
export class XorConstraint implements ValidatorConstraintInterface {
  validate(
    propertyValue: string,
    args: ValidationArguments & { object: Record<string, any> },
  ) {
    return isNil(propertyValue) != isNil(args.object[args.constraints[0]]);
  }

  defaultMessage(args: ValidationArguments) {
    return `CANT_HAVE_BOTH_${args.property}_AND_${args.constraints[0]}`;
  }
}

export const XorValidator = (args: string) => {
  return applyDecorators(
    Validate(XorConstraint, [args]),
    ValidateIf((obj, value) => isNil(value) == isNil(obj[args])),
  );
};
