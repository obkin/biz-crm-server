import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { LoggerService } from 'logger/logger.service';

@Module({
  providers: [UsersService, UsersRepository, LoggerService],
  controllers: [UsersController],
})
export class UsersModule {}
