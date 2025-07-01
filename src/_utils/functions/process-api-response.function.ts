import { BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ClassType } from '../decorators/unique-exists.decorator';

export async function processApiResponse<DTO extends object>(
  rawResponse: any,
  classType: ClassType<DTO>,
): Promise<DTO> {
  const dto = plainToClass(classType, rawResponse);

  const errors = await validate(dto);
  if (errors.length > 0) {
    throw new BadRequestException('Invalid API response format');
  }

  return dto;
}
