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

type RoomStates = {
  videoId: string,
  isPlaying: boolean,
  currentTime: number,
  lastUpdateTimestamp: number
}

@WebSocketGateway(80, {
  namespace: 'WatchParty',
  cors: {
    origin: '*', // Allow all for testing
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private roomStates = new Map<string, RoomStates>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: { text: string }, @ConnectedSocket() client: Socket)  {
    console.log('Received from client:', data.text);
    this.server.to("test room").emit('test', data.text)
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string; videoId: string }) {
    const { roomId, videoId } = payload;
    client.join(roomId);

    let state = this.roomStates.get(roomId);

    if(!state){
      state = {
        videoId: videoId,
        isPlaying: false,
        currentTime: 0,
        lastUpdateTimestamp: Date.now()
      };
      this.roomStates.set(roomId ,state);
    }

    let calculatedTime = state.currentTime;
    if(state.isPlaying){
      const timeElapsed = (Date.now() - state.lastUpdateTimestamp) / 1000;
      calculatedTime += timeElapsed;
    }

    client.emit('initpartystate', { ...state, currentTime: calculatedTime});
  }

  @SubscribeMessage('playbackAction')
  handlePlaybackACtion(client: Socket, @MessageBody() payload: { roomId: string; action: 'play' | 'pause' | 'seek'; time: number}) {
    const { roomId, action, time } = payload;
    const room = this.roomStates.get(roomId);

    if (!room) return;
    
    let newState: RoomStates;

    switch (action) {
      case 'play':
        newState = { ...room, isPlaying: true, currentTime: time, lastUpdateTimestamp: Date.now() };
        break;
      case 'pause':
        newState = { ...room, isPlaying: false, currentTime: time, lastUpdateTimestamp: Date.now() };
        break;
      case 'seek':
        newState = { ...room, currentTime: time, lastUpdateTimestamp: Date.now() };
        break;
    }

    this.roomStates.set(roomId, newState);

    // Rozešleme aktualizovaný stav všem v místnosti (včetně odesílatele)
    this.server.to(roomId).emit('updatePartyState', { 
      isPlaying: newState.isPlaying, 
      time: newState.currentTime 
    });
  }
}
