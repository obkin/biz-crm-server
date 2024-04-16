import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { LoggerService } from 'logger/logger.service';
import { UsersModule } from 'src/users/users.module';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, ConfigService, LoggerService],
  imports: [UsersModule],
})
export class AuthModule {}
