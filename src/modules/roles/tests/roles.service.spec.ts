import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { RolesRepository } from '../roles.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleEntity } from '../entities/role.entity';

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
      rolesRepository.getRoleByName.mockResolvedValue(null); // check if role with such name doesn't exist (true/false)
      rolesRepository.createRole.mockResolvedValue(role);

      const result = await rolesService.createNewRole(createRoleDto);

      expect(rolesRepository.getRoleByName).toHaveBeenCalledWith('admin');
      expect(rolesRepository.createRole);
      expect(result).toEqual(role);
    });
  });
});
