import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_FOLDER_NAME_LENGTH } from '../folder.constants';

export class CreateFolderDto {
  @ApiProperty({
    example: 'Photos',
    description: 'The name of the folder',
    maxLength: MAX_FOLDER_NAME_LENGTH,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(MAX_FOLDER_NAME_LENGTH)
  public name: string;
}
