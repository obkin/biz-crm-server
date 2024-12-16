import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolderEntity } from './entities/folder.entity';
import { In, Not, Repository } from 'typeorm';
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

  async findAllFolders(userId?: number): Promise<FolderEntity[]> {
    try {
      if (userId) {
        return await this.foldersRepository.find({ where: { userId } });
      } else {
        return await this.foldersRepository.find();
      }
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  async findUnauthorizedFolders(
    userId: number,
    folderIds: number[],
  ): Promise<boolean> {
    try {
      const unauthorizedFolder = await this.foldersRepository.findOne({
        where: {
          id: In(folderIds),
          userId: Not(userId),
        },
      });

      return !!unauthorizedFolder;
    } catch (e) {
      throw e;
    }
  }
}
