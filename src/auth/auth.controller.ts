import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('/register')
  async register() {}

  @Post('/login')
  async login() {}

  @Post('/logout')
  async loguot() {}
}
