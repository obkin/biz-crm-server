import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesRepository } from '../roles.repository';
import { RoleEntity } from '../entities/role.entity';

const mockRole = { id: 1, name: 'Admin' };
const mockRoleDto: CreateRoleDto = { name: 'Admin' };
const mockUpdateRoleDto: UpdateRoleDto = { name: 'SuperAdmin' };

const mockRoleRepository = () => ({
  create: jest.fn().mockReturnValue(mockRole),
  save: jest.fn().mockResolvedValue(mockRole),
  update: jest.fn().mockResolvedValue(undefined),
  findOne: jest.fn(),
  delete: jest.fn(),
  find: jest.fn().mockResolvedValue([mockRole]),
});

describe('RolesRepository', () => {
  let rolesRepository: RolesRepository;
  let repository: Repository<RoleEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesRepository,
        {
          provide: getRepositoryToken(RoleEntity),
          useFactory: mockRoleRepository,
        },
      ],
    }).compile();

    rolesRepository = module.get<RolesRepository>(RolesRepository);
    repository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity),
    );
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const result = await rolesRepository.createRole(mockRoleDto);
      expect(result).toEqual(mockRole);
      expect(repository.create).toHaveBeenCalledWith(mockRoleDto);
      expect(repository.save).toHaveBeenCalledWith(mockRole);
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      repository.findOne = jest.fn().mockResolvedValue(mockRole);
      const result = await rolesRepository.updateRole(
        mockRole.id,
        mockUpdateRoleDto,
      );
      expect(result).toEqual(mockRole);
      expect(repository.update).toHaveBeenCalledWith(
        mockRole.id,
        mockUpdateRoleDto,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockRole.id },
      });
    });

    it('should throw NotFoundException if role does not exist', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        rolesRepository.updateRole(mockRole.id, mockUpdateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      repository.delete = jest.fn().mockResolvedValue({ affected: 1 });
      await expect(
        rolesRepository.deleteRole(mockRole.id),
      ).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(mockRole.id);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      repository.delete = jest.fn().mockResolvedValue({ affected: 0 });
      await expect(rolesRepository.deleteRole(mockRole.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRoleById', () => {
    it('should return a role by id', async () => {
      repository.findOne = jest.fn().mockResolvedValue(mockRole);
      const result = await rolesRepository.getRoleById(mockRole.id);
      expect(result).toEqual(mockRole);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockRole.id },
      });
    });

    it('should return null if role is not found', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      const result = await rolesRepository.getRoleById(mockRole.id);
      expect(result).toBeNull();
    });
  });

  describe('getRoleByName', () => {
    it('should return a role by name', async () => {
      repository.findOne = jest.fn().mockResolvedValue(mockRole);
      const result = await rolesRepository.getRoleByName(mockRole.name);
      expect(result).toEqual(mockRole);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: mockRole.name },
      });
    });

    it('should return null if role is not found', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      const result = await rolesRepository.getRoleByName(mockRole.name);
      expect(result).toBeNull();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const result = await rolesRepository.getAllRoles();
      expect(result).toEqual([mockRole]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no roles exist', async () => {
      repository.find = jest.fn().mockResolvedValue([]);
      const result = await rolesRepository.getAllRoles();
      expect(result).toEqual([]);
    });
  });
});
