import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  //   @IsNotEmpty()
  //   @IsDate()
  //   expiresIn: Date;

  ipAddress: string;

  userAgent: string;
}
