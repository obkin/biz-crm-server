import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EmailController } from '../email.controller';
import { EmailService } from '../email.service';
import { SendConfirmationCodeDto } from '../dto/send-confirmation-code.dto';
import { VerifyConfirmationCodeDto } from '../dto/verify-confirmation-code.dto';

describe('EmailController', () => {
  let emailController: EmailController;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            sendConfirmationCode: jest.fn(),
            verifyConfirmationCode: jest.fn(),
          },
        },
      ],
    }).compile();

    emailController = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('sendConfirmationCode', () => {
    it('should send confirmation code and return success message', async () => {
      const dto: SendConfirmationCodeDto = { email: 'test@example.com' };
      const generatedCode = '123456';
      jest
        .spyOn(emailService, 'sendConfirmationCode')
        .mockResolvedValue(generatedCode);

      const result = await emailController.sendConfirmationCode(dto);

      expect(result).toEqual({
        code: generatedCode,
        message: 'Confirmation code sent successfully',
      });
      expect(emailService.sendConfirmationCode).toHaveBeenCalledWith(dto);
    });

    it('should throw HttpException if service throws an exception', async () => {
      const dto: SendConfirmationCodeDto = { email: 'test@example.com' };
      const error = new HttpException('Error', HttpStatus.BAD_REQUEST);
      jest.spyOn(emailService, 'sendConfirmationCode').mockRejectedValue(error);

      await expect(emailController.sendConfirmationCode(dto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle unknown errors and throw HttpException with internal server error', async () => {
      const dto: SendConfirmationCodeDto = { email: 'test@example.com' };
      const error = new Error('Unknown error');
      jest.spyOn(emailService, 'sendConfirmationCode').mockRejectedValue(error);

      await expect(emailController.sendConfirmationCode(dto)).rejects.toThrow(
        new HttpException(
          `Failed to send confirmation code. ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('verifyConfirmationCode', () => {
    it('should verify confirmation code and return success message', async () => {
      const dto: VerifyConfirmationCodeDto = {
        email: 'test@example.com',
        code: '123456',
      };

      jest
        .spyOn(emailService, 'verifyConfirmationCode')
        .mockResolvedValue(true);

      const result = await emailController.verifyConfirmationCode(dto);

      expect(result).toEqual({
        user: dto.email,
        message: 'Confirmation code verified successfully',
      });
      expect(emailService.verifyConfirmationCode).toHaveBeenCalledWith(dto);
    });

    it('should throw HttpException if service throws an exception', async () => {
      const dto: VerifyConfirmationCodeDto = {
        email: 'test@example.com',
        code: '123456',
      };
      const error = new HttpException('Error', HttpStatus.BAD_REQUEST);
      jest
        .spyOn(emailService, 'verifyConfirmationCode')
        .mockRejectedValue(error);

      await expect(emailController.verifyConfirmationCode(dto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle unknown errors and throw HttpException with internal server error', async () => {
      const dto: VerifyConfirmationCodeDto = {
        email: 'test@example.com',
        code: '123456',
      };
      const error = new Error('Unknown error');
      jest
        .spyOn(emailService, 'verifyConfirmationCode')
        .mockRejectedValue(error);

      await expect(emailController.verifyConfirmationCode(dto)).rejects.toThrow(
        new HttpException(
          `Failed to verify confirmation code. ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
