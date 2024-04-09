import { Body, Controller, Post } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Creating a new user' })
  @Post('/register')
  async register(@Body() userRegisterDto: UserRegisterDto) {
    if (userRegisterDto) {
      return 'ok';
    }
  }

  @ApiOperation({ summary: 'User authorization' })
  @Post('/login')
  async login() {}

  @ApiOperation({ summary: 'Logging out of the system' })
  @Post('/logout')
  async loguot() {}
}
