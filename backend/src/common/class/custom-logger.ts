import { Logger } from '@nestjs/common';

export class CustomLogger {
  private logger: Logger;

  constructor(name: string) {
    this.logger = new Logger(`server:${name}`);
  }

  logInfo(info: { method: string; data?: any }): void {
    const { method, data } = info;
    this.logger.log(method);
    if (data) {
      this.logger.verbose(data);
    }
  }

  logInfoMsg(msg: string): void {
    this.logger.log(msg);
  }

  logError(info: { method: string; data?: any; e: any }): void {
    const { method, data, e } = info;
    this.logger.error(method);
    if (data) {
      this.logger.verbose(data);
    }
    this.logger.error(JSON.stringify(e));
  }
}
