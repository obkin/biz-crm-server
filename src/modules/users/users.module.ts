import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/users.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { UserBlockHistoryEntity } from './entities/user-block-history.entity';
import { ResponseLogger } from 'src/common/interceptors/response-logger.interceptor';
import { UsersEventListener } from './events/users-event.listener';
import { EmailModule } from '../email/email.module';
import { UserDeletionEntity } from './entities/user-deletion.entity';
import { UsersManagementController } from './controllers/users-management.controller';
import { UsersManagementService } from './services/users-management.service';
import { UsersManagementRepository } from './repositories/users-management.repository';

@Module({
  controllers: [UsersController, UsersManagementController],
  providers: [
    UsersService,
    UsersRepository,
    UsersManagementService,
    UsersManagementRepository,
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
