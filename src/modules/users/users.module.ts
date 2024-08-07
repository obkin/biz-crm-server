import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { UserBlockHistoryEntity } from './entities/user-block-history.entity';
import { LoggerInterceptor } from 'src/common/interceptors/logging.interceptor';
import { UserEventListener } from 'src/events/user.event-listener';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    ConfigService,
    LoggerInterceptor,
    UserEventListener,
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, UserBlockHistoryEntity]),
    JwtModule,
    RolesModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
