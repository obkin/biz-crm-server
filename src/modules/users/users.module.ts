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
import { ResponseLogger } from 'src/common/interceptors/response-logger.interceptor';
import { UsersEventListener } from './events/users-event.listener';
import { EmailModule } from '../email/email.module';
import { UserDeletionEntity } from './entities/user-deletion.entity';
import { UsersDeletionService } from './services/users-deletion.service';
import { UsersDeletionRepository } from './repositories/users-deletion.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersDeletionService,
    UsersDeletionRepository,
    ConfigService,
    ResponseLogger,
    UsersEventListener,
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserBlockHistoryEntity,
      UserDeletionEntity,
    ]),
    JwtModule,
    RolesModule,
    EmailModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
