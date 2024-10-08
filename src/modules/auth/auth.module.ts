import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenEntity } from './entities/access-token.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from './auth.repository';
import { RedisModule } from '../redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthEventListener } from './events/auth-event.listener';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    AccessTokenRepository,
    ConfigService,
    AuthEventListener,
  ],
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity, AccessTokenEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule,
    UsersModule,
    RedisModule,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
