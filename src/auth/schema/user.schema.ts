import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,

  roles: { type: [String], default: ['user'] },

  banned: { type: Boolean, default: false },
  banDate: { type: Date, default: null },
  banReason: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface User extends mongoose.Document {
  username: string;
  email: string;
  password: string;

  roles: string[];

  banned: boolean;
  banDate: Date | null;
  banReason: string;

  createdAt: Date;
  updatedAt: Date;
}
