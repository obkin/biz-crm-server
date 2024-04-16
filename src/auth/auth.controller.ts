import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRegisterDto } from 'src/users/dto/user-register.dto';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      return await this.authService.registerUser(dto);
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
