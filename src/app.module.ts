import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  controllers: [],
  providers: [LoggerService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EmailModule,
    RolesModule,
  ],
})
export class AppModule {}
