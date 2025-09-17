import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io';

@WebSocketGateway(80,{ namespace: "WatchParty"})
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('test')
    handleEvent(@MessageBody() body: { text: string }): string {
        return body.text;
    }
}