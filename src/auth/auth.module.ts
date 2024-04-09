import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { LoggerService } from 'logger/logger.service';

@Module({
  providers: [AuthService, AuthRepository, LoggerService],
  controllers: [AuthController],
})
export class AuthModule {}
