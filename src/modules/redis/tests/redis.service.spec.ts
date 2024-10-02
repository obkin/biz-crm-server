import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';

describe('RedisService', () => {
  let redisService: RedisService;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    redisClient = module.get<Redis>('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  describe('set', () => {
    it('should set a key-value pair without TTL', async () => {
      await redisService.set('testKey', 'testValue');
      expect(redisClient.set).toHaveBeenCalledWith('testKey', 'testValue');
    });

    it('should set a key-value pair with TTL', async () => {
      await redisService.set('testKey', 'testValue', 3600);
      expect(redisClient.set).toHaveBeenCalledWith(
        'testKey',
        'testValue',
        'EX',
        3600,
      );
    });

    it('should log an error if set fails', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      (redisClient.set as jest.Mock).mockRejectedValue(
        new Error('Redis set failed'),
      );

      await redisService.set('testKey', 'testValue');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to set key testKey in Redis: Redis set failed',
      );
    });
  });

  describe('get', () => {
    it('should return a value for an existing key', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue('testValue');

      const result = await redisService.get('testKey');
      expect(result).toBe('testValue');
      expect(redisClient.get).toHaveBeenCalledWith('testKey');
    });

    it('should return null if the key does not exist', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);

      const result = await redisService.get('testKey');
      expect(result).toBeNull();
      expect(redisClient.get).toHaveBeenCalledWith('testKey');
    });

    it('should log an error if get fails', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      (redisClient.get as jest.Mock).mockRejectedValue(
        new Error('Redis get failed'),
      );

      const result = await redisService.get('testKey');

      expect(result).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to get key testKey from Redis: Redis get failed',
      );
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await redisService.del('testKey');
      expect(redisClient.del).toHaveBeenCalledWith('testKey');
    });

    it('should log an error if delete fails', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      (redisClient.del as jest.Mock).mockRejectedValue(
        new Error('Redis delete failed'),
      );

      await redisService.del('testKey');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to delete key testKey from Redis: Redis delete failed',
      );
    });
  });
});
