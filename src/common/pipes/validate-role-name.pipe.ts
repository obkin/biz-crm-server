import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RoleNameValidationPipe implements PipeTransform<any> {
  transform(value: any) {
    if (value.name !== undefined) {
      if (typeof value.name !== 'string') {
        throw new BadRequestException('Name must be a string');
      }

      const nameRegex = /^[A-Za-z]+$/;
      if (!nameRegex.test(value.name)) {
        throw new BadRequestException('Name can only contain letters');
      }
    }
    return value;
  }
}
