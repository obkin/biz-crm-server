import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserRegisterDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'User name must be at least 3 characters long',
  })
  @MaxLength(20, {
    message: 'User name must not exceed 20 characters',
  })
  readonly username: string;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}
