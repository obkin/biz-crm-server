import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyConfirmationCodeDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address associated with the confirmation code',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '123456',
    description: 'The confirmation code received by the user',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  readonly code: string;
}
