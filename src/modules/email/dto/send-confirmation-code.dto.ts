import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendConfirmationCodeDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to send the confirmation code to',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
