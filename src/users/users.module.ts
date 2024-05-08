import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { LoggerService } from 'logger/logger.service';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/entities/user.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, LoggerService],
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  exports: [UsersService],
})
export class UsersModule {}
