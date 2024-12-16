import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { FolderEntity } from './entities/folder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersRepository } from './folders.repository';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, FoldersRepository],
  imports: [TypeOrmModule.forFeature([FolderEntity]), UsersModule],
  exports: [FoldersService, FoldersRepository],
})
export class FoldersModule {}
