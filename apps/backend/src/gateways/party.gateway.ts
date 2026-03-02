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
import type { JoinParty, PartyUser, PlaybackData, PlayerAction, ChatMessage } from './dto';
import { RoomManagementService } from "./room-management.service"
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway(80, {
  namespace: 'Party',
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // Track room playback state: { [roomId]: { videoId: string, currentTime: number, isPlaying: boolean } }
  private roomStates = new Map<string, { videoId: string, currentTime: number, isPlaying: boolean }>();

  constructor(
    private readonly roomService: RoomManagementService,
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {}

  private async validateToken(client: Socket) {}

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const result = this.roomService.removeUserBySocketId(client.id);
    if (!result) return;

    const { roomId, user: userInfo } = result;

    client.to(roomId).emit('userLeft', { userInfo });
  }


  @SubscribeMessage('createParty')
  async handlePartyCreation(@ConnectedSocket() client: Socket, @MessageBody() user: PartyUser) {
    await this.validateToken(client);
    const roomId = uuidv4();

    client.data.user = user;
    client.data.roomId = roomId;

    client.join(roomId);

    this.roomService.addUserToRoom(roomId, user, client.id);

    client.emit('partyCreated', { roomId });
  }

  @SubscribeMessage('joinParty')
  async handlePartyJoin(@ConnectedSocket() client: Socket, @MessageBody() data: JoinParty) {
    this.validateToken(client);
    const { roomId, ...userInfo } = data;

    if (!this.roomService.doesRoomExist(roomId)) {
      client.emit('roomNotFound');
      return;
    }

    client.data.user = userInfo;
    client.data.roomId = roomId;

    client.join(roomId);

    this.roomService.addUserToRoom(roomId, userInfo, client.id);

    const allMembersInRoom = this.roomService.getUsersInRoom(roomId); 

    // Send existing state to the newly joined member
    const roomState = this.roomStates.get(roomId);

    client.emit('partyJoined', { members: allMembersInRoom, state: roomState });

    client.to(roomId).emit('newUserJoined', { userInfo })
  }

  @SubscribeMessage('leaveParty')
  async handlePartyLeave(@ConnectedSocket() client: Socket) {
    this.validateToken(client);
    const result = this.roomService.removeUserBySocketId(client.id);
    if (!result) return;

    const { roomId, user: userInfo } = result;

    client.to(roomId).emit('userLeft', { userInfo })

    client.leave(roomId);
  }

  @SubscribeMessage('startPlayback')
  async handleStartPlayback(@ConnectedSocket() client: Socket, @MessageBody() data: PlaybackData) {
    this.validateToken(client);
    let roomId = client.data.roomId;
    if (!roomId) return;

    this.roomStates.set(roomId, { videoId: data.videoId, currentTime: data.currentTime, isPlaying: true });

    client.to(roomId).emit('startPlayback', {videoId: data.videoId, currentTime: data.currentTime})
  }

  @SubscribeMessage('playbackAction')
  async handlePlaybackAction(@ConnectedSocket() client: Socket, @MessageBody() action: any) {
    this.validateToken(client);
    const roomId = client.data.roomId;
    if (!roomId) return;

    // Update state cache
    const currentState = this.roomStates.get(roomId);
    if (currentState) {
      if (action.action === 'PLAY') currentState.isPlaying = true;
      if (action.action === 'PAUSE') currentState.isPlaying = false;
      if (action.time !== undefined) currentState.currentTime = action.time;
    }

    client.to(roomId).emit('syncPlayback', action)
  }

  @SubscribeMessage('syncState')
  async handleSyncState(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.validateToken(client);
    const roomId = client.data.roomId;
    if (!roomId) return;

    // Update server side state tracking
    const state = this.roomStates.get(roomId);
    if (state) {
        state.currentTime = data.time;
        state.isPlaying = data.isPlaying;
    }

    client.to(roomId).emit('syncPlayback', {
      ...data,
      isHeartbeat: true
    });
  }

  @SubscribeMessage('endPlayback') 
  async handleEndPlayback(@ConnectedSocket() client: Socket) {
    this.validateToken(client);
    let roomId = client.data.roomId;
    if (!roomId) return;

    this.roomStates.delete(roomId);
    client.to(roomId).emit('endPlayback');
  }
}