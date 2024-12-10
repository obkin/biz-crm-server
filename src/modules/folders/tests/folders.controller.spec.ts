import { Test, TestingModule } from '@nestjs/testing';
import { FoldersController } from '../folders.controller';

describe('FoldersController', () => {
  let controller: FoldersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoldersController],
    }).compile();

    controller = module.get<FoldersController>(FoldersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
