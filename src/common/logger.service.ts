import { Injectable } from '@nestjs/common';
import { ILogObj, ISettingsParam, Logger } from 'tslog';

const loggerSettings = {
  displayInstanceName: false,
  displayLoggerName: false,
  displayFilePath: 'hidden',
  displayFunctionName: false,
};

@Injectable()
export class LoggerService {
  logger: Logger<ILogObj>;

  constructor() {
    this.logger = new Logger<ILogObj>(
      loggerSettings as ISettingsParam<ILogObj>,
    );
  }

  log(...args: unknown[]): void {
    this.logger.info(...args);
  }
  error(...args: unknown[]): void {
    // save errors to DB
    this.logger.error(...args);
  }
  warn(...args: unknown[]): void {
    this.logger.warn(...args);
  }
}
