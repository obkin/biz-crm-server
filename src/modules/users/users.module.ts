import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { LoggerService } from 'src/common/logger/logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { UserBlockHistoryEntity } from './entities/user-block-history.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, ConfigService, LoggerService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, UserBlockHistoryEntity]),
    JwtModule,
    RolesModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
