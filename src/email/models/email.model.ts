import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Email extends Document {
  @ApiProperty({ example: 'john_dope@gmail.com' })
  @Prop() // need to add foreign key
  email: string;

  @ApiProperty({ example: true, description: 'Email verification status' })
  @Prop({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: '123456', description: 'Email verification code' })
  @Prop({ default: null })
  emailVerificationCode: string;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'Last verification code sent date',
  })
  @Prop({ default: null })
  lastVerificationCodeSentAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'Verification code expiration date',
  })
  @Prop({ default: null })
  verificationCodeExpiration: Date;

  @ApiProperty({
    example: 0,
    description: 'Number of verification attempts',
  })
  @Prop({ default: 0 })
  verificationAttempts: number;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
