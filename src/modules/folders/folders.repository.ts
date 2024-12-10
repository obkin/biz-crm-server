import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolderEntity } from './entities/folder.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FoldersRepository {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly foldersRepository: Repository<FolderEntity>,
  ) {}
}
