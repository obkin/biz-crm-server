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
  describe('updateRole', () => {
    it('should update a role successfully', async () => {
      const updatedRole = { ...mockRole, name: 'user' };
      mockRolesService.updateRole.mockResolvedValue(updatedRole);

      const dto = { name: 'user' };
      expect(await rolesController.updateRole(1, dto)).toEqual(updatedRole);
      expect(rolesService.updateRole).toHaveBeenCalledWith(1, dto);
    });

    it('should handle errors while updating a role', async () => {
      const error = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockRolesService.updateRole.mockRejectedValue(error);
      const dto = { name: 'user' };

      await expect(rolesController.updateRole(1, dto)).rejects.toThrow(error);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role successfully', async () => {
      mockRolesService.deleteRole.mockResolvedValue(undefined);
      const response = await rolesController.deleteRole(1);
      expect(response).toEqual({ id: 1, message: 'Role deleted' });
      expect(rolesService.deleteRole).toHaveBeenCalledWith(1);
    });

    it('should handle errors while deleting a role', async () => {
      const error = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockRolesService.deleteRole.mockRejectedValue(error);

      await expect(rolesController.deleteRole(1)).rejects.toThrow(error);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles successfully', async () => {
      mockRolesService.getAllRoles.mockResolvedValue([mockRole]);

      const response = await rolesController.getAllRoles();
      expect(response).toEqual({ rolesAmount: 1, rolesArray: [mockRole] });
      expect(rolesService.getAllRoles).toHaveBeenCalled();
    });

    it('should handle errors while retrieving roles', async () => {
      const error = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockRolesService.getAllRoles.mockRejectedValue(error);

      await expect(rolesController.getAllRoles()).rejects.toThrow(error);
    });
  });
});
