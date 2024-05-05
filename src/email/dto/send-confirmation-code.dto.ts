import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendConfirmationCodeDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
