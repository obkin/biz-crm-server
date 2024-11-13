import { Injectable } from '@nestjs/common';
import {
  ThrottlerOptionsFactory,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          ttl: Number(this.configService.get<number>('THROTTLE_TTL')),
          limit: Number(this.configService.get<number>('THROTTLE_LIMIT')),
        },
      ],
    };
  }
}
