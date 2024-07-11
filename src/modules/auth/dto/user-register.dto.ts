import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserRegisterDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
