import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangeBlockRecordDateDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the block record which status will be changed',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly blockRecordId: number;

  @ApiProperty({
    example: true,
    description: 'The new date when user will be unblocked',
  })
  @IsString()
  @IsNotEmpty()
  readonly date: string;
}
