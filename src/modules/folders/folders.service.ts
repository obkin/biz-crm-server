import { Injectable, Logger } from '@nestjs/common';
import { FoldersRepository } from './folders.repository';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderEntity } from './entities/folder.entity';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(private readonly foldersRepository: FoldersRepository) {}

  async createFolder(
    userId: number,
    dto: CreateFolderDto,
  ): Promise<FolderEntity> {
    try {
      const folder = await this.foldersRepository.createNewFolder(userId, dto);
      this.logger.log(`New folder created (id: ${folder.id})`);
      return folder;
    } catch (e) {
      throw e;
    }
  }

  //   async findAllFolders(
  //     userId: number,
  //     ownerId?: number,
  //   ): Promise<FolderEntity[]> {
  //     try {
  //       // ...
  //     } catch (e) {
  //       throw e;
  //     }
  //   }

  //   async findOneFolder(userId: number, folderId: number): Promise<FolderEntity> {
  //     try {
  //       // ...
  //     } catch (e) {
  //       throw e;
  //     }
  //   }

  //   async updateFolder(
  //     userId: number,
  //     folderId: number,
  //     dto: UpdateFolderDto,
  //   ): Promise<FolderEntity> {
  //     try {
  //       // ...
  //     } catch (e) {
  //       throw e;
  //     }
  //   }

  //   async removeFolder(userId: number, folderId: number): Promise<void> {
  //     try {
  //       // ...
  //     } catch (e) {
  //       throw e;
  //     }
  //   }
}
