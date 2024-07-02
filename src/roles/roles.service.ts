import { ConflictException, Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async createNewRole(dto: CreateRoleDto): Promise<RoleEntity> {
    try {
      const role = await this.getRoleByName(dto.name);
      if (!role) {
        return await this.rolesRepository.createRole(dto);
      } else {
        throw new ConflictException('Such role already exists');
      }
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
      return await this.rolesRepository.getAllRoles();
    } catch (e) {
      throw e;
    }
  }
}
