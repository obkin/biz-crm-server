import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity } from 'src/auth/entities/access-token.entity';
import { RefreshTokenEntity } from 'src/auth/entities/refresh-token.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        entities: [UserEntity, RefreshTokenEntity, AccessTokenEntity],
        synchronize: true, // Enable synchronization (auto-create tables) in development mode
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
