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
export class ResponseLogger implements NestInterceptor {
  private readonly logger = new Logger(ResponseLogger.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userId = request.user?.id;
    const startTime = Date.now();

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
            `userId: ${userId}, duration: ${duration}ms, responseSize: ${contentLength || 0} bytes }\n`,
        );
      }),
    );
  }
}
