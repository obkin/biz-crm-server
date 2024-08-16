import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailCodeGenerator } from 'utils/email-code-generator';
import { RedisModule } from '../redis/redis.module';

@Module({
  providers: [EmailService, EmailCodeGenerator],
  controllers: [EmailController],
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
          defaults: {
            from: `"No Reply" <${configService.get('EMAIL_FROM')}>`,
          },
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
})
export class EmailModule {}
