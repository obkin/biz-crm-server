import { Module, ValidationPipe } from '@nestjs/common';
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
import { LoggerInterceptor } from './common/interceptors/logging.interceptor';
import { RedisModule } from './modules/redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    Reflector,
    LoggerService,
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    DatabaseModule,
    RedisModule,
    UsersModule,
    AuthModule,
    EmailModule,
    RolesModule,
    EventEmitterModule.forRoot(),
  ],
  exports: [],
})
export class AppModule {}
