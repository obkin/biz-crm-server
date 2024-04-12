import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateEmailPipe
  implements PipeTransform<string, Promise<string>>
{
  async transform(value: string): Promise<string> {
    const isValid = /\S+@\S+\.\S+/.test(value);
    if (!isValid) {
      throw new BadRequestException('Invalid email');
    }
    return value;
  }
}
