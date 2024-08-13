import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UserNameValidationPipe implements PipeTransform<any> {
  transform(value: any) {
    const username = value.username;
    if (!/^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ]+$/.test(username.replace(/\s/g, ''))) {
      throw new BadRequestException('User name must contain only letters');
    }

    const spaceCount = (username.match(/\s/g) || []).length;
    if (spaceCount > 2) {
      throw new BadRequestException(
        'User name must not contain more than two spaces',
      );
    }
    return value;
  }
}
