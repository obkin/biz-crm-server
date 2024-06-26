import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from 'src/common/logger.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, LoggerService],
  imports: [ConfigModule],
})
export class RolesModule {}
