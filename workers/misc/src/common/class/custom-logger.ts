import { Logger } from '@nestjs/common';

export class CustomLogger {
  readonly logger: Logger;

  constructor(name: string) {
    this.logger = new Logger(`worker:address:${name}`);
  }

  logError(info: { method: string; e: any; data?: any }): void {
    const { method, data, e } = info;
    this.logger.error(method);
    this.logger.error(JSON.stringify(e));
    if (data) {
      this.logger.verbose(data);
    }
  }

  logInfo(info: { method: string; data?: any }): void {
    const { method, data } = info;
    this.logger.log(method);
    if (data) {
      this.logger.verbose(data);
    }
  }

  logMsg(msg: string): void {
    this.logger.log(msg);
  }
}
