import { ClientProxy } from '@nestjs/microservices';
import { CustomLogger } from '../../common';
import { ClientMsg } from '../../models';

export abstract class ClientSerivce<T> extends CustomLogger {
  protected client: ClientProxy;
  protected patterns: string[];
  private name: string;

  constructor(name: string) {
    super(name);
    this.name = name;
  }

  private async onApplicationBootstrap(): Promise<void> {
    this.logInfoMsg(`${this.name} connected...`);
  }

  notify(msg: ClientMsg<T>): void {
    const { pattern, data } = msg;
    if (this.patterns.includes(pattern)) {
      this.client.emit(pattern, data);
    }
  }
}
