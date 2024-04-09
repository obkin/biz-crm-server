import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
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
    UsersModule,
    DatabaseModule,
  ],
})
export class AppModule {}
