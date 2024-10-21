import { Test, TestingModule } from '@nestjs/testing';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from '../auth.repository';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccessTokenEntity } from '../entities/access-token.entity';
import { AccessTokenDto } from '../dto/access-token.dto';

describe('RefreshTokenRepository', () => {
  let refreshTokenRepository: RefreshTokenRepository;
  let mockRefreshTokenRepository: Repository<RefreshTokenEntity>;

  let accessTokenRepository: AccessTokenRepository;
  let mockAccessTokenRepository: Repository<AccessTokenEntity>;

  const mockRefreshTokenEntity: RefreshTokenEntity = {
    id: 1,
    refreshToken: 'some-refresh-token',
    userId: 1,
    expiresIn: new Date(),
    ipAddress: '192.168.0.1',
    userAgent: 'Chrome',
    createdAt: new Date(),
  };

  const refreshTokenDto: RefreshTokenDto = {
    userId: 1,
    refreshToken: 'refresh-token',
    expiresIn: new Date(),
    ipAddress: '192.168.0.1',
    userAgent: 'Mozila',
  };

  const mockAccessTokenEntity: AccessTokenEntity = {
    id: 1,
    accessToken: 'some-access-token',
    userId: 1,
    expiresIn: new Date(),
    createdAt: new Date(),
  };

  const accessTokenDto: AccessTokenDto = {
    userId: 1,
    accessToken: 'access-token',
    expiresIn: new Date(),
  };

  const mockFaliedDeleteResult: DeleteResult = {
    affected: 0,
    raw: {},
  };

  const mockSuccessfulDeleteResult: DeleteResult = {
    affected: 1,
    raw: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenRepository,
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockRefreshTokenEntity),
            save: jest.fn().mockResolvedValue(mockRefreshTokenEntity),
            delete: jest.fn().mockResolvedValue(mockSuccessfulDeleteResult),
            findOne: jest.fn().mockResolvedValue(mockRefreshTokenEntity),
            find: jest.fn().mockResolvedValue([mockRefreshTokenEntity]),
          },
        },
        AccessTokenRepository,
        {
          provide: getRepositoryToken(AccessTokenEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockAccessTokenEntity),
            save: jest.fn().mockReturnValue(mockAccessTokenEntity),
            delete: jest.fn().mockResolvedValue(mockSuccessfulDeleteResult),
            findOne: jest.fn().mockResolvedValue(mockAccessTokenEntity),
            find: jest.fn().mockResolvedValue([mockAccessTokenEntity]),
          },
        },
      ],
    }).compile();

    refreshTokenRepository = module.get<RefreshTokenRepository>(
      RefreshTokenRepository,
    );
    mockRefreshTokenRepository = module.get<Repository<RefreshTokenEntity>>(
      getRepositoryToken(RefreshTokenEntity),
    );

    accessTokenRepository = module.get<AccessTokenRepository>(
      AccessTokenRepository,
    );
    mockAccessTokenRepository = module.get<Repository<AccessTokenEntity>>(
      getRepositoryToken(AccessTokenEntity),
    );
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'create')
        .mockReturnValue(mockRefreshTokenEntity);
      jest
        .spyOn(mockRefreshTokenRepository, 'save')
        .mockResolvedValue(mockRefreshTokenEntity);

      const result =
        await refreshTokenRepository.saveRefreshToken(refreshTokenDto);
      expect(result).toEqual(mockRefreshTokenEntity);
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
        refreshTokenDto,
      );
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        mockRefreshTokenEntity,
      );
    });

    it('should use EntityManager if provided', async () => {
      const mockManager: EntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRefreshTokenRepository),
      } as unknown as EntityManager;

      const result = await refreshTokenRepository.saveRefreshToken(
        refreshTokenDto,
        mockManager,
      );

      expect(mockManager.getRepository).toHaveBeenCalledWith(
        RefreshTokenEntity,
      );
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
        refreshTokenDto,
      );
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        mockRefreshTokenEntity,
      );
      expect(result).toEqual(mockRefreshTokenEntity);
    });

    it('should throw an error if save fails', async () => {
      const error = new Error('Save failed');
      jest.spyOn(mockRefreshTokenRepository, 'save').mockRejectedValue(error);

      await expect(
        refreshTokenRepository.saveRefreshToken(refreshTokenDto),
      ).rejects.toThrow('Save failed');
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token successfully', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'delete')
        .mockResolvedValue(mockSuccessfulDeleteResult);

      await expect(
        refreshTokenRepository.deleteRefreshToken(1),
      ).resolves.not.toThrow();

      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: 1,
      });
    });

    it('should use EntityManager if provided', async () => {
      const mockManager: EntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRefreshTokenRepository),
      } as unknown as EntityManager;

      jest
        .spyOn(mockRefreshTokenRepository, 'delete')
        .mockResolvedValue(mockSuccessfulDeleteResult);

      await refreshTokenRepository.deleteRefreshToken(1, mockManager);

      expect(mockManager.getRepository).toHaveBeenCalledWith(
        RefreshTokenEntity,
      );
      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: 1,
      });
    });

    it('should throw NotFoundException if token is not found on delete', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'delete')
        .mockResolvedValue(mockFaliedDeleteResult);

      await expect(
        refreshTokenRepository.deleteRefreshToken(1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRefreshTokenByUserId', () => {
    it('should find refresh token by userId using default repository', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'findOne')
        .mockResolvedValue(mockRefreshTokenEntity);

      const result = await refreshTokenRepository.findRefreshTokenByUserId(1);

      expect(result).toEqual(mockRefreshTokenEntity);
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should find refresh token by userId using EntityManager', async () => {
      const mockManager: EntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRefreshTokenRepository),
      } as unknown as EntityManager;

      jest
        .spyOn(mockRefreshTokenRepository, 'findOne')
        .mockResolvedValue(mockRefreshTokenEntity);

      const result = await refreshTokenRepository.findRefreshTokenByUserId(
        1,
        mockManager,
      );

      expect(result).toEqual(mockRefreshTokenEntity);
      expect(mockManager.getRepository).toHaveBeenCalledWith(
        RefreshTokenEntity,
      );
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should return null if no refresh token found', async () => {
      jest.spyOn(mockRefreshTokenRepository, 'findOne').mockResolvedValue(null);

      const result = await refreshTokenRepository.findRefreshTokenByUserId(2);

      expect(result).toBeNull();
      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 2 },
      });
    });

    it('should throw an error if repository throws an exception', async () => {
      const error = new InternalServerErrorException('Database error');
      jest
        .spyOn(mockRefreshTokenRepository, 'findOne')
        .mockRejectedValue(error);

      await expect(
        refreshTokenRepository.findRefreshTokenByUserId(1),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockRefreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('getAllRefreshTokens', () => {
    it('should return all refresh tokens', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'find')
        .mockResolvedValue([mockRefreshTokenEntity]);

      const result = await refreshTokenRepository.getAllRefreshTokens();
      expect(result).toEqual([mockRefreshTokenEntity]);
    });

    it('should throw an error if repository throws an exception', async () => {
      const error = new InternalServerErrorException('Database error');
      jest.spyOn(mockRefreshTokenRepository, 'find').mockRejectedValue(error);

      await expect(
        refreshTokenRepository.getAllRefreshTokens(),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockRefreshTokenRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveAccessToken', () => {
    it('should save access token', async () => {
      jest
        .spyOn(mockAccessTokenRepository, 'create')
        .mockReturnValue(mockAccessTokenEntity);
      jest
        .spyOn(mockAccessTokenRepository, 'save')
        .mockResolvedValue(mockAccessTokenEntity);

      const result =
        await accessTokenRepository.saveAccessToken(accessTokenDto);
      expect(result).toEqual(mockAccessTokenEntity);
      expect(mockAccessTokenRepository.create).toHaveBeenCalledWith(
        accessTokenDto,
      );
      expect(mockAccessTokenRepository.save).toHaveBeenCalledWith(
        mockAccessTokenEntity,
      );
    });

    it('should use EntityManager if provided', async () => {
      const mockManager: EntityManager = {
        getRepository: jest.fn().mockReturnValue(mockAccessTokenRepository),
      } as unknown as EntityManager;

      const result = await accessTokenRepository.saveAccessToken(
        accessTokenDto,
        mockManager,
      );

      expect(mockManager.getRepository).toHaveBeenCalledWith(AccessTokenEntity);
      expect(mockAccessTokenRepository.create).toHaveBeenCalledWith(
        accessTokenDto,
      );
      expect(mockAccessTokenRepository.save).toHaveBeenCalledWith(
        mockAccessTokenEntity,
      );
      expect(result).toEqual(mockAccessTokenEntity);
    });

    it('should throw an error if save fails', async () => {
      const error = new Error('Save failed');
      jest.spyOn(mockAccessTokenRepository, 'save').mockRejectedValue(error);

      await expect(
        accessTokenRepository.saveAccessToken(accessTokenDto),
      ).rejects.toThrow('Save failed');
    });
  });

  describe('deleteAccessToken', () => {});

  describe('findAccessTokenByUserId', () => {});

  describe('getAllAccessTokens', () => {});
});
