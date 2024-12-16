import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { FoldersRepository } from './folders.repository';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderEntity } from './entities/folder.entity';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(
    private readonly foldersRepository: FoldersRepository,
    private readonly usersService: UsersService,
  ) {}

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

  async findAllFolders(
    userId: number,
    ownerId?: number,
  ): Promise<FolderEntity[]> {
    try {
      if (!ownerId) {
        const isAdmin = await this.usersService.checkIsUserAdmin(userId);
        if (!isAdmin) {
          throw new ForbiddenException(
            `You do not have permission to get or modify this folder(s)`,
          );
        }
      }

      const folders = await this.foldersRepository.findAllFolders(ownerId);

      if (ownerId) {
        const folderIds = folders.map((folder) => folder.id);
        await this.verifyAccess(userId, folderIds);
      }

      return folders;
    } catch (e) {
      throw e;
    }
  }

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

  // --- Methods ---

  private async verifyAccess(
    userId: number,
    folderIds: number[],
  ): Promise<void> {
    const isAdmin = await this.usersService.checkIsUserAdmin(userId);
    if (isAdmin) {
      return;
    }

    const hasUnauthorized =
      await this.foldersRepository.findUnauthorizedFolders(userId, folderIds);

    if (hasUnauthorized) {
      throw new ForbiddenException(
        `You do not have permission to get or modify this folder(s)`,
      );
    }
  }
}
