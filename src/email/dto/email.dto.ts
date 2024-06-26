import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
