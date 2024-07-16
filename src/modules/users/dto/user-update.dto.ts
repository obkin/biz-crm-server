import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly password?: string;
}
