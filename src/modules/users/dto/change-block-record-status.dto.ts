import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class ChangeBlockRecordStatusDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the block record which status will be changed',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly blockRecordId: number;

  @ApiProperty({
    example: true,
    description: 'The new status indicating if the block is active or not',
  })
  @IsBoolean()
  @IsNotEmpty()
  readonly isActive: boolean;
}
