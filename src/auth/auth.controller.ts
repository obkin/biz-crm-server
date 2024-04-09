import { Body, Controller, Post } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { ApiOperation } from '@nestjs/swagger';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Creating a new user' })
  @Post('/register')
  async register(@Body() userRegisterDto: UserRegisterDto) {
    if (userRegisterDto) {
      return 'register ok';
    }
  }

  @ApiOperation({ summary: 'User authorization' })
  @Post('/login')
  async login(@Body() userLoginDto: UserLoginDto) {
    if (userLoginDto) {
      return 'login ok';
    }
  }

  @ApiOperation({ summary: 'Logging out of the system' })
  @Post('/logout')
  async loguot() {}
}
