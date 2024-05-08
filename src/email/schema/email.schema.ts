import * as mongoose from 'mongoose';

export const EmailSchema = new mongoose.Schema({});

export interface Email extends mongoose.Document {
  username: string;
  email: string;
  password: string;

  roles: string[];

  banned: boolean;
  banDate: Date | null;
  banReason: string | null;

  createdAt: Date;
  updatedAt: Date;
}
