import { ClientProxy } from '@nestjs/microservices';
import { ClientMsg } from '../../models';

export class ClientSerivce<T> {
  protected client: ClientProxy;
  protected patterns: string[];

  constructor(private readonly name: string) {}

  private async onApplicationBootstrap(): Promise<void> {
    console.log(`${this.name} connected...\n`);
  }

  notify(msg: ClientMsg<T>): void {
    const { pattern, data } = msg;
    if (this.patterns.includes(pattern)) {
      this.client.emit(pattern, data);
    }
  }
}
