import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @ApiProperty({ example: 'John' })
  @Prop()
  username: string;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  @Prop()
  email: string;

  @ApiProperty({
    example: '$2b$10$fWHZ.JcwITaj9M.bJJLaDuPK399J3LnEirrJMSuLRt9F8LeyltXRu',
  })
  @Prop()
  password: string;

  @ApiProperty({ example: ['user'] })
  @Prop({ default: ['user'] })
  roles: string[];

  @ApiProperty({ example: 'false' })
  @Prop({ default: false })
  banned: boolean;

  @ApiProperty({ example: 'null' })
  @Prop({ default: null })
  banDate: Date;

  @ApiProperty({ example: 'null' })
  @Prop({ default: null })
  banReason: string;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'Account created date',
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    example: '2024-04-12T08:44:37.025Z',
    description: 'Account updated date',
  })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
