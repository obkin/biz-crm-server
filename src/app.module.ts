import {
  MiddlewareConsumer,
  NestModule,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { RolesModule } from './modules/roles/roles.module';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
  Reflector,
} from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpErrorFilter } from './common/filters/http-error.filter';
import { RedisModule } from './modules/redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ResponseLogger } from './common/interceptors/response-logger.interceptor';
import { RequestLogger } from './common/middlewares/request-logger.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigService } from './common/config/throttler-config.service';
import { UsersBlockGuard } from './common/guards/users-block.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { ExpiredBlocksUpdaterService } from './common/tasks/expired-blocks-updater.service';
import { UsersManagementService } from './modules/users/services/users-management.service';

@Module({
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UsersBlockGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseLogger,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    Reflector,
    LoggerService,
    ExpiredBlocksUpdaterService,
    UsersManagementService,
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfigService,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    UsersModule,
    AuthModule,
    EmailModule,
    RolesModule,
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLogger).forRoutes('*');
  }
}
