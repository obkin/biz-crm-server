import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userId = request.user?.id;
    const startTime = Date.now();
    const requestId = uuidv4();

    console.log(`\nNew request: [${requestId}]`);
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
        console.log(`Request is complete \n`);
      }),
    );
  }
}
