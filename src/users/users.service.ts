import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './models/user.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(dto: UserRegisterDto) {
    try {
      if (dto) {
        const createdUser = new this.userModel(dto);
        return createdUser.save();
      }
    } catch (e) {
      // ...
    }
  }

  async login() {}

  async logout() {}
}
