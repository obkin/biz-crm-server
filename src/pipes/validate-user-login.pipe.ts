import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UserLoginDto } from 'src/users/dto/user-login.dto';

@Injectable()
export class ValidateUserLoginPipe implements PipeTransform {
  async transform(value: any) {
    const userLoginDto = plainToClass(UserLoginDto, value);
    const errors = await validate(userLoginDto);

    if (errors.length > 0) {
      throw new BadRequestException('Invalid credentials');
    }

    return value;
  }
}
