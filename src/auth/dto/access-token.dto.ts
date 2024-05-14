import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AccessTokenDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  expiresIn: Date;
}
