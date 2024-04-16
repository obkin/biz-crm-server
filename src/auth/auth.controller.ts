import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  @Post('/register')
  async register() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }

  @Post('/login')
  async login() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }

  async logout() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }
}
