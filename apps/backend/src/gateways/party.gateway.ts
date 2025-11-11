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
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from "uuid";
import type { JoinParty, PartyUser } from './dto';
import { RoomManagmentService } from "./room-managment.service"

@WebSocketGateway(80, {
  namespace: 'Party',
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(private readonly roomService: RoomManagmentService) {}
  
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    this.roomService.removeUserBySocketId(client.id);

    let userInfo = client.data.user;
    let roomId = client.data.roomId;

    client.to(roomId).emit('user_left', { userInfo })
  }

  @SubscribeMessage('create_party')
  async handlePartyCreation(@ConnectedSocket() client: Socket, @MessageBody() user: PartyUser) {
    const roomId = uuidv4();

    client.data.user = user;
    client.data.roomId = roomId;

    client.join(roomId);

    this.roomService.addUserToRoom(roomId, user, client.id);

    client.emit('party_created', { roomId })
  }

  @SubscribeMessage('join_party')
  async handlePartyJoin(@ConnectedSocket() client: Socket, @MessageBody() data: JoinParty) {
    const { roomId, ...userInfo } = data;

    client.data.user = userInfo;
    client.data.roomId = roomId;

    client.join(roomId);

    this.roomService.addUserToRoom(roomId, userInfo, client.id);

    client.to(roomId).emit('new_user_joined', { userInfo })
  }

  @SubscribeMessage('leave_party')
  async handlePartyLeave(@ConnectedSocket() client: Socket) {
    this.roomService.removeUserBySocketId(client.id);
    
    let userInfo = client.data.user;
    let roomId = client.data.roomId;
    
    client.to(roomId).emit('user_left', { userInfo })
    client.leave(roomId);
  }

//   @SubscribeMessage('join')
//   async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string; videoId: string, user: User }) {
//     const { roomId, videoId, user } = payload;

//     client.data.user = user;
//     client.data.roomId = roomId;

//     client.join(roomId);

//     let state = this.roomStates.get(roomId);

//     if(!state){
//       state = {
//         videoId: videoId,
//         isPlaying: false,
//         currentTime: 0,
//         lastUpdateTimestamp: Date.now()
//       };
//       this.roomStates.set(roomId ,state);
//     }

//     let calculatedTime = state.currentTime;
//     if(state.isPlaying){
//       const timeElapsed = (Date.now() - state.lastUpdateTimestamp) / 1000;
//       calculatedTime += timeElapsed;
//     }

//     const socketsInRoom = await this.server.in(roomId).fetchSockets();

//     // Map them to user data, *excluding* the new client
//     const usersInRoom = socketsInRoom
//       .filter(socket => socket.id !== client.id)
//       .map(socket => {
//         return {
//           socketId: socket.id,
//           ...socket.data.user
//         };
//       });

//     client.emit('initpartystate', { ...state, currentTime: calculatedTime, users: usersInRoom});
//     client.to(roomId).emit('userJoined', { 
//       socketId: client.id,
//       ...user
//      })

//     //TODO: získání uživatelských dat pro zaslání zpět,; abych mohl získat data o uživatelích a zobrazit je v UI
//   }


//   @SubscribeMessage('startPlayback')
//   handlePlayback(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string, videoId: string }) {
//     const { roomId, videoId } = payload;
//     let state = this.roomStates.get(roomId);

//     if(!state){
//       client.disconnect();
//       return;
//     }

//     state.videoId = videoId;
//     state.currentTime = 0;
//     state.isPlaying = true;
//     state.lastUpdateTimestamp = Date.now();

//     this.roomStates.set(roomId, state);

//     client.to(roomId).emit('playbackStarted', {
//       videoId: state.videoId,
//       currentTime: state.currentTime,
//       timeStamp: state.lastUpdateTimestamp
//     });

//     client.emit('playbackStartedSuccesfully')
//   }

//   @SubscribeMessage('playbackAction')
//   handlePlaybackACtion(client: Socket, @MessageBody() payload: { roomId: string; action: 'play' | 'pause' | 'seek'; time: number}) {
//     const { roomId, action, time } = payload;
//     const room = this.roomStates.get(roomId);

//     if (!room) return;
    
//     let newState: RoomStates;

//     switch (action) {
//       case 'play':
//         newState = { ...room, isPlaying: true, currentTime: time, lastUpdateTimestamp: Date.now() };
//         break;
//       case 'pause':
//         newState = { ...room, isPlaying: false, currentTime: time, lastUpdateTimestamp: Date.now() };
//         break;
//       case 'seek':
//         newState = { ...room, currentTime: time, lastUpdateTimestamp: Date.now() };
//         break;
//     }

//     this.roomStates.set(roomId, newState);

//     // Rozešleme aktualizovaný stav všem v místnosti (včetně odesílatele)
//     this.server.to(roomId).emit('updatePartyState', { 
//       isPlaying: newState.isPlaying, 
//       time: newState.currentTime 
//     });
//   }
}