import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const userId = request.user?.id;
    const startTime = Date.now();

    // request /api/auth/login does not return userId in logging

    this.logger.log(
      `Req: { method: ${method}, path: ${url}, userId: ${userId} }`,
    );

    return next.handle().pipe(
      tap(() => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        const contentLength = context
          .switchToHttp()
          .getResponse()
          .get('Content-Length');
        const duration = Date.now() - startTime;

        this.logger.log(
          `Res: { method: ${method}, path: ${url}, status: ${statusCode}, ` +
            `userId: ${userId}, duration: ${duration}ms, responseSize: ${contentLength || 0} bytes }`,
        );
      }),
    );
  }
}
