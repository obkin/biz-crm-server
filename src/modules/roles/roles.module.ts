import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, LoggerService],
  imports: [ConfigModule, TypeOrmModule.forFeature([RoleEntity]), JwtModule],
  exports: [RolesService],
})
export class RolesModule {}
