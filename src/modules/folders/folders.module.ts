import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { FolderEntity } from './entities/folder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersRepository } from './folders.repository';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, FoldersRepository],
  imports: [TypeOrmModule.forFeature([FolderEntity])],
  exports: [FoldersService, FoldersRepository],
})
export class FoldersModule {}
