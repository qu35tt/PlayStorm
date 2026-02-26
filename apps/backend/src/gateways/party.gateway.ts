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
import type { JoinParty, PartyUser, PlaybackData, PlayerAction } from './dto';
import { RoomManagementService } from "./room-management.service"
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway(80, {
  namespace: 'Party',
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(
    private readonly roomService: RoomManagementService,
    private readonly jwtService: JwtService
  ) {}
  
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        throw new Error('No token provided');
      }

      this.jwtService.verify(token);
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.log(`Client disconnected (Unauthorized): ${client.id}`);
      client.disconnect();
    }
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

    if (!this.roomService.doesRoomExist(roomId)) {
      client.emit('room_not_found');
      return;
    }

    client.data.user = userInfo;
    client.data.roomId = roomId;

    client.join(roomId);

    this.roomService.addUserToRoom(roomId, userInfo, client.id);

    const allMembersInRoom = this.roomService.getUsersInRoom(roomId); 

    client.emit('party_joined', { members: allMembersInRoom });

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

  @SubscribeMessage('start_playback')
  async handleStartPlayback(@ConnectedSocket() client: Socket, @MessageBody() data: PlaybackData) {
    let roomId = client.data.roomId;
    
    if (this.roomService.getRoomHost(roomId) !== client.data.user.id) return;

    client.to(roomId).emit('start_playback', {videoId: data.videoId, currentTime: data.currentTime})
  }

  @SubscribeMessage('playback_action')
  async handlePlaybackAction(@ConnectedSocket() client: Socket, @MessageBody() action: PlayerAction) {
    let roomId = client.data.roomId;

    if (this.roomService.getRoomHost(roomId) !== client.data.user.id) return;

    client.to(roomId).emit('sync_playback', action)
  }

  @SubscribeMessage('end_playback') 
  async handleEndPlayback(@ConnectedSocket() client: Socket) {
    let roomId = client.data.roomId;

    if (this.roomService.getRoomHost(roomId) !== client.data.user.id) return;

    client.to(roomId).emit('end_playback');
  }

  // @SubscribeMessage('kick_user')
  // async handleKickUser(@ConnectedSocket() client: Socket, @MessageBody() userId: string ){
  //   let roomId = client.data.roomId;
  //   let kickedUserSocketId = await this.roomService.findSocketIdByUserId(userId);
  //   console.log(kickedUserSocketId);
  //   if(!kickedUserSocketId) return;

  //   this.server.to(kickedUserSocketId).emit('kicked');
  // }
}