import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/email.dto';

@Controller('/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @HttpCode(200)
  @Post('/send-code')
  async sendCode(@Body() dto: EmailDto) {
    try {
      const generatedCode = await this.emailService.sendConfirmationCode(dto);
      return {
        code: generatedCode,
        message: 'Confirmation code sent successfully',
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          `Failed to compare confirmation code: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // async compareCodes(@Body() dto: string) {
  //   try {
  //     // ...
  //   } catch (e) {
  //     if (e instanceof ConflictException) {
  //       throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
  //     } else {
  //       throw new HttpException(
  //         `Failed to send confirmation code: ${e}`,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   }
  // }
}
