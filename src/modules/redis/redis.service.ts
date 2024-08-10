import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  getClient(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
    try {
      if (ttlInSeconds) {
        await this.redisClient.set(key, value, 'EX', ttlInSeconds);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (e) {
      this.logger.error(`Failed to set key ${key} in Redis: ${e.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (e) {
      this.logger.error(`Failed to get key ${key} from Redis: ${e.message}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (e) {
      this.logger.error(`Failed to delete key ${key} from Redis: ${e.message}`);
    }
  }
}
