import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolderEntity } from './entities/folder.entity';
import { Repository } from 'typeorm';
import { CreateFolderDto } from './dto/create-folder.dto';

@Injectable()
export class FoldersRepository {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly foldersRepository: Repository<FolderEntity>,
  ) {}

  async createNewFolder(
    userId: number,
    dto: CreateFolderDto,
  ): Promise<FolderEntity> {
    try {
      const folder = this.foldersRepository.create(dto);
      folder.userId = userId;
      return await this.foldersRepository.save(folder);
    } catch (e) {
      throw e;
    }
  }
}
