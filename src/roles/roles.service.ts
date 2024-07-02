import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async createNewRole(dto: CreateRoleDto): Promise<RoleEntity> {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }
}
