import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { timeStamp } from 'console';
import { throwError } from 'rxjs';
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
    origin: '*',
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

    client.emit('initpartystate', { ...state, currentTime: calculatedTime, user: client.data});
    this.server.to(roomId).emit('userJoined')

    //TODO: získání uživatelských dat pro zaslání zpět,; abych mohl získat data o uživatelích a zobrazit je v UI
  }

  @SubscribeMessage('startPlayback')
  handlePlayback(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string, videoId: string }) {
    const { roomId, videoId } = payload;
    let state = this.roomStates.get(roomId);

    if(!state){
      client.disconnect();
      return;
    }

    state.videoId = videoId;
    state.currentTime = 0;
    state.isPlaying = true;
    state.lastUpdateTimestamp = Date.now();

    this.roomStates.set(roomId, state);

    client.to(roomId).emit('playbackStarted', {
      videoId: state.videoId,
      currentTime: state.currentTime,
      timeStamp: state.lastUpdateTimestamp
    });

    client.emit('playbackStartedSuccesfully')
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
