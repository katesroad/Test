import { Logger } from '@nestjs/common';

export class CustomLogger {
  readonly logger: Logger;

  constructor(name: string) {
    this.logger = new Logger(`worker:balance:${name}`);
  }

  logInfo(info: { method: string; data?: any }): void {
    const { method, data } = info;
    this.logger.log(method);
    if (data) {
      this.logger.verbose(data);
    }
  }

  logError(info: { method: string; e: any; data?: any }): void {
    const { method, e, data } = info;
    this.logger.error(method);
    console.log(e);
    if (data) {
      this.logger.verbose(data);
    }
  }

  logInfoMsg(msg: string): void {
    this.logger.log(msg);
  }

  logErrorMsg(msg: string): void {
    this.logger.error(msg);
  }
}
