import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const userId = request.user?.id;
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: [],
    };

    if (typeof error === 'object' && error !== null) {
      if (error.hasOwnProperty('message')) {
        errorResponse.message = Array.isArray(error['message'])
          ? error['message']
          : [error['message']];
      } else {
        errorResponse.message = [error];
      }
    } else {
      errorResponse.message = [error];
    }

    const logMessage = `Res: { method: ${request.method}, path: ${request.url}, statusCode: ${status}, userId: ${userId}, message: ${exception.message} }\n`;

    if (status >= 500) {
      this.logger.error(logMessage, exception.stack);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json(errorResponse);
  }
}
