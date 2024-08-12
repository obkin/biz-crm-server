import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestLogger implements NestMiddleware {
  private readonly logger = new Logger(RequestLogger.name);

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl;
    const requestId = uuidv4();

    console.log(`\nNew request: [${requestId}]`);
    this.logger.log(`Req: { method: ${method}, path: ${url} }`);

    req.headers['x-request-id'] = requestId;
    next();
  }
}
