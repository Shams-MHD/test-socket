import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message, ServerToClientEvents } from './types/events';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt/ws-jwt.guard';
import { SocketAuthMiddleWare } from '../auth/ws-jwt/ws.middleware';

@WebSocketGateway({ namespace: 'events' })
@UseGuards(WsJwtGuard)
export class EventsGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  afterInit(client: Socket) {
    client.use(SocketAuthMiddleWare() as any);
    Logger.log('after init');
  }

  @WebSocketServer()
  wss: Server<any, any>;

  onGatewayInit(client: Socket): any {
    Logger.log('gateway inialized mhmd');
  }
  handleConnection(client: any, ...args): any {
    console.log(client.id);
  }
  handleDisconnect(client: any): any {}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.wss.to(client.id).emit('testEvent','message recived !!')
    return 'Hello world!';
  }

  sendMessage(message: Message) {
    this.wss.emit('newMessage', message);
  }
}
