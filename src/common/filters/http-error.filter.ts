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
  private readonly shouldLog: boolean;

  constructor(shouldLog: boolean = false) {
    this.shouldLog = shouldLog;
  }

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
      message: {},
    };

    if (typeof error === 'object' && error !== null) {
      if ('message' in error) {
        errorResponse.message = Array.isArray(error.message)
          ? error.message
          : [error.message];
      } else {
        errorResponse.message = error;
      }
    } else {
      errorResponse.message = [error];
    }

    if (this.shouldLog && status !== 500) {
      this.logger.warn(
        `Res: { method: ${request.method}, path: ${request.url}, statusCode: ${status}, userId: ${userId}, message: ${exception.message} }`,
      );
    } else {
      this.logger.error(
        `"method: ${request.method}", "path: ${request.url}", "statusCode: ${status}". error: ${exception.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
