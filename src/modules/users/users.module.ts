import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/users.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { UserBlockEntity } from './entities/user-block.entity';
import { ResponseLogger } from 'src/common/interceptors/response-logger.interceptor';
import { UsersEventListener } from './events/users-event.listener';
import { EmailModule } from '../email/email.module';
import { UserDeletionEntity } from './entities/user-deletion.entity';
import { UsersManagementController } from './controllers/users-management.controller';
import { UsersManagementService } from './services/users-management.service';
import {
  UsersBlockRepository,
  UsersDelitionRepository,
  UsersUnblockRepository,
} from './repositories/users-management.repository';
import { UserUnblockEntity } from './entities/user-unblock.entity';

@Module({
  controllers: [UsersController, UsersManagementController],
  providers: [
    UsersService,
    UsersRepository,
    UsersManagementService,
    UsersBlockRepository,
    UsersUnblockRepository,
    UsersDelitionRepository,
    ConfigService,
    ResponseLogger,
    UsersEventListener,
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserBlockEntity,
      UserUnblockEntity,
      UserDeletionEntity,
    ]),
    JwtModule,
    RolesModule,
    EmailModule,
  ],
  exports: [
    UsersService,
    UsersManagementService,
    UsersRepository,
    UsersBlockRepository,
    UsersUnblockRepository,
    UsersDelitionRepository,
  ],
})
export class UsersModule {}
