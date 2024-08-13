import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UserNameValidationPipe implements PipeTransform {
  transform(value: any) {
    // Перевірка чи значення є рядком
    if (typeof value !== 'string') {
      throw new BadRequestException('Name must be a string');
    }

    // Перевірка чи рядок містить лише букви (латинські та кириличні)
    if (!/^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ]+$/.test(value.replace(/\s/g, ''))) {
      throw new BadRequestException('Name must contain only letters');
    }

    // Перевірка чи немає більше двох пробілів
    const spaceCount = (value.match(/\s/g) || []).length;
    if (spaceCount > 2) {
      throw new BadRequestException(
        'Name must not contain more than two spaces',
      );
    }

    return value;
  }
}
