import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from '../email.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailCodeGenerator } from 'src/utils/email-code-generator';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendConfirmationCodeDto } from '../dto/send-confirmation-code.dto';
import { BadRequestException } from '@nestjs/common';
import { VerifyConfirmationCodeDto } from '../dto/verify-confirmation-code.dto';

describe('EmailService', () => {
  let emailService: EmailService;
  let mailerService: MailerService;
  let redisService: RedisService;
  let emailCodeGenerator: EmailCodeGenerator;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn().mockReturnValue({
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    }),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockEmailCodeGenerator = {
    generateConfirmationCode: jest.fn().mockReturnValue('123456'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('600'), // 10 minutes in seconds
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: EmailCodeGenerator, useValue: mockEmailCodeGenerator },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    redisService = module.get<RedisService>(RedisService);
    emailCodeGenerator = module.get<EmailCodeGenerator>(EmailCodeGenerator);
  });

  describe('sendConfirmationCode', () => {
    it('should throw BadRequestException if email is not provided', async () => {
      const dto: SendConfirmationCodeDto = { email: '' };

      await expect(emailService.sendConfirmationCode(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should send confirmation code and save it in Redis', async () => {
      const dto: SendConfirmationCodeDto = { email: 'test@example.com' };
      const redisClient = redisService.getClient();
      const confirmationCode = '123456';

      const result = await emailService.sendConfirmationCode(dto);

      expect(emailCodeGenerator.generateConfirmationCode).toHaveBeenCalledWith(
        6,
      );
      expect(redisClient.set).toHaveBeenCalledWith(
        `confirmation_code:${dto.email}`,
        confirmationCode,
        'EX',
        Number(mockConfigService.get('REDIS_EMAIL_CONFIRMATION_CODE_LIFE')),
      );
      expect(mailerService.sendMail).toHaveBeenCalled();
      expect(result).toBe(confirmationCode);
    });
  });

  describe('verifyConfirmationCode', () => {
    it('should throw BadRequestException if the code is not found in Redis', async () => {
      mockRedisService.get.mockReturnValueOnce(null);
      const dto: VerifyConfirmationCodeDto = {
        email: 'test@example.com',
        code: '123456',
      };

      await expect(emailService.verifyConfirmationCode(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if the code is invalid', async () => {
      mockRedisService.get.mockReturnValueOnce('654321');
      const dto: VerifyConfirmationCodeDto = {
        email: 'test@example.com',
        code: '123456',
      };

      await expect(emailService.verifyConfirmationCode(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should verify and delete the confirmation code', async () => {
      mockRedisService.get.mockReturnValueOnce('123456');
      const dto: VerifyConfirmationCodeDto = {
        email: 'test@example.com',
        code: '123456',
      };

      const result = await emailService.verifyConfirmationCode(dto);

      expect(result).toBe(true);
      expect(redisService.del).toHaveBeenCalledWith(
        `confirmation_code:${dto.email}`,
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.emailVerified', {
        userEmail: dto.email,
      });
    });
  });
});
