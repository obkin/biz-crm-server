import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenRepository } from '../auth.repository';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { NotFoundException } from '@nestjs/common';

describe('RefreshTokenRepository', () => {
  let refreshTokenRepository: RefreshTokenRepository;
  let mockRepository: Repository<RefreshTokenEntity>;

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

  //   const accessTokenDto: AccessTokenDto = {
  //     userId: 1,
  //     accessToken: 'access-token',
  //     expiresIn: new Date(),
  //   };

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
      ],
    }).compile();

    refreshTokenRepository = module.get<RefreshTokenRepository>(
      RefreshTokenRepository,
    );
    mockRepository = module.get<Repository<RefreshTokenEntity>>(
      getRepositoryToken(RefreshTokenEntity),
    );
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token', async () => {
      jest
        .spyOn(mockRepository, 'save')
        .mockResolvedValue(mockRefreshTokenEntity);

      const result =
        await refreshTokenRepository.saveRefreshToken(refreshTokenDto);
      expect(result).toEqual(mockRefreshTokenEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(mockRefreshTokenEntity);
    });

    it('should use EntityManager if provided', async () => {
      const mockManager: EntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      } as unknown as EntityManager;

      const result = await refreshTokenRepository.saveRefreshToken(
        refreshTokenDto,
        mockManager,
      );

      expect(mockManager.getRepository).toHaveBeenCalledWith(
        RefreshTokenEntity,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(refreshTokenDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockRefreshTokenEntity);
      expect(result).toEqual(mockRefreshTokenEntity);
    });

    it('should throw an error if save fails', async () => {
      jest
        .spyOn(mockRepository, 'save')
        .mockRejectedValue(new Error('Save failed'));

      await expect(
        refreshTokenRepository.saveRefreshToken(refreshTokenDto),
      ).rejects.toThrow('Save failed');
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token successfully', async () => {
      jest
        .spyOn(mockRepository, 'delete')
        .mockResolvedValue(mockSuccessfulDeleteResult);

      await expect(
        refreshTokenRepository.deleteRefreshToken(1),
      ).resolves.not.toThrow();

      expect(mockRepository.delete).toHaveBeenCalledWith({ userId: 1 });
    });

    it('should use EntityManager if provided', async () => {
      const mockManager: EntityManager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      } as unknown as EntityManager;

      jest
        .spyOn(mockRepository, 'delete')
        .mockResolvedValue(mockSuccessfulDeleteResult);

      await refreshTokenRepository.deleteRefreshToken(1, mockManager);

      expect(mockManager.getRepository).toHaveBeenCalledWith(
        RefreshTokenEntity,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith({ userId: 1 });
    });

    it('should throw NotFoundException if token is not found on delete', async () => {
      jest
        .spyOn(mockRepository, 'delete')
        .mockResolvedValue(mockFaliedDeleteResult);

      await expect(
        refreshTokenRepository.deleteRefreshToken(1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  //   it('should find a refresh token by userId', async () => {
  //     jest
  //       .spyOn(mockRepository, 'findOne')
  //       .mockResolvedValue(mockRefreshTokenEntity);

  //     const result = await refreshTokenRepository.findRefreshTokenByUserId(1);
  //     expect(result).toEqual(mockRefreshTokenEntity);
  //   });

  //   it('should return all refresh tokens', async () => {
  //     jest
  //       .spyOn(mockRepository, 'find')
  //       .mockResolvedValue([mockRefreshTokenEntity]);

  //     const result = await refreshTokenRepository.getAllRefreshTokens();
  //     expect(result).toEqual([mockRefreshTokenEntity]);
  //   });
});
