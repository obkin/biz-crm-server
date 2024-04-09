import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from 'logger/logger.service';
import { DatabaseModule } from './database/database.module';

@Module({
  controllers: [],
  providers: [LoggerService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    AuthModule,
    DatabaseModule,
  ],
})
export class AppModule {}
