import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async createNewRole(dto: CreateRoleDto): Promise<RoleEntity> {
    try {
      const role = await this.getRoleByName(dto.name);
      if (role) {
        throw new ConflictException('Such role already exists');
      }
      return await this.rolesRepository.createRole(dto);
    } catch (e) {
      throw e;
    }
  }

  async updateRole(id: number, dto: UpdateRoleDto): Promise<RoleEntity> {
    try {
      const role = await this.getRoleById(id);
      const roleExists = await this.getRoleByName(dto.name);
      if (!role) {
        throw new NotFoundException(`Role #${id} does not exist`);
      }
      if (roleExists) {
        throw new ConflictException('Such role already exists');
      }
      return await this.rolesRepository.updateRole(id, dto);
    } catch (e) {
      throw e;
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      return await this.rolesRepository.deleteRole(id);
    } catch (e) {
      throw e;
    }
  }

  async getRoleById(id: number): Promise<RoleEntity> {
    try {
      return await this.rolesRepository.getRoleById(id);
    } catch (e) {
      throw e;
    }
  }

  async getRoleByName(name: string): Promise<RoleEntity> {
    try {
      return await this.rolesRepository.getRoleByName(name);
    } catch (e) {
      throw e;
    }
  }

  async getAllRoles(): Promise<RoleEntity[]> {
    try {
      const rolesArray = await this.rolesRepository.getAllRoles();
      if (rolesArray.length === 0) {
        throw new NotFoundException('There are no roles');
      }
      return rolesArray;
    } catch (e) {
      throw e;
    }
  }
}
