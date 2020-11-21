import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HelperService {
  readonly logger: Logger = new Logger(`worker:tx`);

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
    this.logger.verbose(e);
    console.log(e);
    if (data) {
      console.log(data);
    }
  }

  logInfoMsg(msg: string): void {
    this.logger.log(msg);
  }

  logErrorMsg(msg: string): void {
    this.logger.error(msg);
  }

  verbose(data: any) {
    this.logger.verbose(data);
  }

  async sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      }, ms);
    });
  }
}
