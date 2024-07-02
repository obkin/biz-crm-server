import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async createRole(dto: CreateRoleDto): Promise<RoleEntity> {
    const role = this.rolesRepository.create(dto);
    return await this.rolesRepository.save(role);
  }

  async getRoleById(id: number): Promise<RoleEntity | null> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getRoleByName(name: string): Promise<RoleEntity | null> {
    return await this.rolesRepository.findOne({ where: { name } });
  }

  async getAllRoles(): Promise<RoleEntity[] | null> {
    const roles = await this.rolesRepository.find();
    if (!roles) {
      throw new NotFoundException('There are no roles');
    }
    return roles;
  }
}
