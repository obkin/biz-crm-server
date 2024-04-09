import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';

@Injectable()
export class UsersService {
  async register(dto: UserRegisterDto) {
    try {
      if (dto) {
        // ...
      }
    } catch (e) {
      // ...
    }
  }

  async login() {}

  async logout() {}
}
