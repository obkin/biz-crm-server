import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity } from 'src/modules/auth/entities/access-token.entity';
import { RefreshTokenEntity } from 'src/modules/auth/entities/refresh-token.entity';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserBlockEntity } from '../users/entities/user-block.entity';
import { UserDeletionEntity } from '../users/entities/user-deletion.entity';
import { UserUnblockEntity } from '../users/entities/user-unblock.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { FolderEntity } from '../folders/entities/folder.entity';
import { OrderEntity } from '../orders/entities/order.entity';

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
        entities: [
          UserEntity,
          UserBlockEntity,
          UserUnblockEntity,
          UserDeletionEntity,
          RefreshTokenEntity,
          AccessTokenEntity,
          RoleEntity,
          ProductEntity,
          FolderEntity,
          OrderEntity,
        ],
        synchronize: true, // Enable synchronization (auto-create tables) in development mode
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
