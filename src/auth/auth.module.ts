import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { LoggerService } from 'logger/logger.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, LoggerService],
})
export class AuthModule {}
