import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { RolesRepository } from '../roles.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleEntity } from '../entities/role.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from '../dto/update-role.dto';

describe('RolesService', () => {
  let rolesService: RolesService;
  let rolesRepository: Partial<jest.Mocked<RolesRepository>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: {
            createRole: jest.fn(),
            getRoleById: jest.fn(),
            getRoleByName: jest.fn(),
            updateRole: jest.fn(),
            deleteRole: jest.fn(),
            getAllRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesService = module.get<RolesService>(RolesService);
    rolesRepository = module.get<RolesRepository, jest.Mocked<RolesRepository>>(
      RolesRepository,
    );
  });

  describe('createNewRole', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = { name: 'admin' };
      const role = new RoleEntity();
      rolesRepository.getRoleByName.mockResolvedValue(null);
      rolesRepository.createRole.mockResolvedValue(role);

      const result = await rolesService.createNewRole(createRoleDto);

      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith('admin');
      expect(rolesRepository.createRole);
      expect(result).toEqual(role);
    });

    it('should throw ConflictException if role already exists', async () => {
      const createRoleDto: CreateRoleDto = { name: 'admin' };
      const role = new RoleEntity();
      rolesRepository.getRoleByName.mockResolvedValue(role);

      await expect(rolesService.createNewRole(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateRole', () => {
    it('should update the role', async () => {
      const updateRoleDto: UpdateRoleDto = { name: 'user' };
      const role = new RoleEntity();
      rolesRepository.getRoleById.mockResolvedValue(role);
      rolesRepository.getRoleByName.mockResolvedValue(null);
      rolesRepository.updateRole.mockResolvedValue(role);

      const result = await rolesService.updateRole(1, updateRoleDto);

      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(1);
      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith('user');
      expect(rolesRepository.updateRole).toHaveBeenCalledWith(1, updateRoleDto);
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      rolesRepository.getRoleById.mockResolvedValue(null);

      await expect(
        rolesService.updateRole(1, { name: 'user' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if another role with the same name exists', async () => {
      const existingRole = new RoleEntity();
      rolesRepository.getRoleById.mockResolvedValue(existingRole);
      rolesRepository.getRoleByName.mockResolvedValue(existingRole);

      await expect(
        rolesService.updateRole(1, { name: 'admin' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteRole', () => {
    it('should delete the role without checking if it exists', async () => {
      rolesRepository.deleteRole.mockResolvedValue(undefined);

      await rolesService.deleteRole(1);

      expect(rolesRepository.deleteRole).toHaveBeenCalledWith(1);
    });
  });

  describe('getRoleById', () => {
    it('should return the role', async () => {
      const role = new RoleEntity();
      rolesRepository.getRoleById.mockResolvedValue(role);

      const result = await rolesService.getRoleById(1);

      expect(rolesRepository.getRoleById).toHaveBeenCalledWith(1);
      expect(result).toEqual(role);
    });
  });

  describe('getRoleByName', () => {
    it('should return the role by name', async () => {
      const role = new RoleEntity();
      rolesRepository.getRoleByName.mockResolvedValue(role);

      const result = await rolesService.getRoleByName('admin');

      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith('admin');
      expect(result).toEqual(role);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const roles = [new RoleEntity(), new RoleEntity()];
      rolesRepository.getAllRoles.mockResolvedValue(roles);

      const result = await rolesService.getAllRoles();

      expect(rolesRepository.getAllRoles).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });

    it('should throw NotFoundException if no roles found', async () => {
      rolesRepository.getAllRoles.mockResolvedValue([]);

      await expect(rolesService.getAllRoles()).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
