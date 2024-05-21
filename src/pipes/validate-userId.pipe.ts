import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class UserIdValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      throw new BadRequestException('User ID is required');
    }

    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      throw new BadRequestException('User ID must be a valid number');
    }

    return parsedValue;
  }
}
