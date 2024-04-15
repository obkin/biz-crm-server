import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const id = value;
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    return id;
  }
}
