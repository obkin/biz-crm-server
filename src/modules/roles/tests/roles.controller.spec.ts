import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RoleEntity } from '../entities/role.entity';

describe('RolesController', () => {
  let rolesController: RolesController;
  let rolesService: RolesService;

  const mockRole: RoleEntity = {
    id: 1,
    name: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRolesService = {
    createNewRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    getAllRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    rolesController = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      mockRolesService.createNewRole.mockResolvedValue(mockRole);
      const dto = { name: 'admin' };
      expect(await rolesController.createRole(dto)).toEqual(mockRole);
      expect(rolesService.createNewRole).toHaveBeenCalledWith(dto);
    });

    it('should handle errors while creating a role', async () => {
      const error = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockRolesService.createNewRole.mockRejectedValue(error);
      const dto = { name: 'admin' };

      await expect(rolesController.createRole(dto)).rejects.toThrow(error);
    });
  });
});
