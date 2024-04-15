import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.model';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createNewUser(dto: UserRegisterDto) {
    try {
      const createdUser = new this.userModel(dto);
      return await createdUser.save();
    } catch (e) {
      throw e;
    }
  }

  async findOneUserByEmail(email: string) {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (e) {
      throw e;
    }
  }

  async findOneUserById(id: string) {
    try {
      return await this.userModel.findById(id).exec();
    } catch (e) {
      throw e;
    }
  }

  async getAllExistingUsers() {
    try {
      return await this.userModel.find().exec();
    } catch (e) {
      throw e;
    }
  }
}
