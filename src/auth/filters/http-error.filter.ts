import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from 'src/common/logger/logger.service';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  private readonly loggerService = new LoggerService();

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
    };

    // this.loggerService.error(
    //   `[ExceptionFilter] "method: ${request.method}", "path: ${request.url}", "statusCode: ${status}". Error: ${exception.message}`,
    // );

    response.status(status).json(errorResponse);
  }
}
