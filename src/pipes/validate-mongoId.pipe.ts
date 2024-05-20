import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateMongoIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const id = value;
    if (!id) {
      throw new BadRequestException('ID parameter is required');
    }
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid MongoDB ObjectId. ID must be a 24 character hex string, 12 byte Uint8Array, or an integer',
      );
    }
    return id;
  }
}
