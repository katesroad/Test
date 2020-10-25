import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

// We don't subscribe message. We broadcast message directly to all clients.
@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('server:gateway');
  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log(`\n
    ===================\n
    Gateway initialzed.\n
    ===================`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`The client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`The client ${client.id} disconencted.`);
  }
}
