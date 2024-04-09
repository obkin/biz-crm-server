import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';

@Injectable()
export class AuthService {
  async register(dto: UserRegisterDto) {
    try {
        // ...
    } catch (e) {
        // ...
    }
  }

  async login() {}

  async logout() {}
}
