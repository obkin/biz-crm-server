import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class EmptyObjectValidationPipe implements PipeTransform {
  transform(value: any) {
    if (
      value &&
      Object.keys(value).length === 0 &&
      value.constructor === Object
    ) {
      throw new BadRequestException('The input object must not be empty');
    }
    return value;
  }
}
