import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TokensDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  expiresIn: Date;

  ipAddress: string;

  userAgent: string;
}
