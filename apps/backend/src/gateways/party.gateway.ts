import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(80, {
  namespace: 'WatchParty',
  cors: {
    origin: '*', // Allow all for testing
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: { text: string }, @ConnectedSocket() client: Socket)  {
    console.log('Received from client:', data.text);

    // Emit back to the same client
    client.emit('test', `Message: ${data.text}`);
  }
}
