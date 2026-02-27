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
      client.data.token = token; // Store token for periodic re-validation
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.log(`Client disconnected (Unauthorized): ${client.id}`);
      client.disconnect();
    }
  }

  private validateToken(client: Socket) {
    try {
      const token = client.data.token;
      if (!token) throw new Error();
      this.jwtService.verify(token);
    } catch (error) {
      client.disconnect();
      throw new Error('Unauthorized');
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    const result = this.roomService.removeUserBySocketId(client.id);
    if (!result) return;

    const { roomId, user: userInfo, newHostId } = result;

    client.to(roomId).emit('userLeft', { userInfo });
    
    if (newHostId) {
      this.server.to(roomId).emit('newHost', { hostId: newHostId });
    }
  }

  
  @SubscribeMessage('createParty')
  async handlePartyCreation(@ConnectedSocket() client: Socket, @MessageBody() user: PartyUser) {
    this.validateToken(client);
    const roomId = uuidv4();

    client.data.user = user;
    client.data.roomId = roomId;

    client.join(roomId);

    this.roomService.addUserToRoom(roomId, user, client.id);

    client.emit('partyCreated', { roomId, hostId: user.id });
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
    const hostId = this.roomService.getRoomHost(roomId);

    client.emit('partyJoined', { members: allMembersInRoom, hostId });

    client.to(roomId).emit('newUserJoined', { userInfo })
  }

  @SubscribeMessage('leaveParty')
  async handlePartyLeave(@ConnectedSocket() client: Socket) {
    this.validateToken(client);
    const result = this.roomService.removeUserBySocketId(client.id);
    if (!result) return;

    const { roomId, user: userInfo, newHostId } = result;
    
    client.to(roomId).emit('userLeft', { userInfo })
    
    if (newHostId) {
      this.server.to(roomId).emit('newHost', { hostId: newHostId });
    }

    client.leave(roomId);
  }

  @SubscribeMessage('startPlayback')
  async handleStartPlayback(@ConnectedSocket() client: Socket, @MessageBody() data: PlaybackData) {
    this.validateToken(client);
    let roomId = client.data.roomId;

    client.to(roomId).emit('startPlayback', {videoId: data.videoId, currentTime: data.currentTime})
  }

  @SubscribeMessage('playbackAction')
  async handlePlaybackAction(@ConnectedSocket() client: Socket, @MessageBody() action: PlayerAction) {
    this.validateToken(client);
    let roomId = client.data.roomId;

    client.to(roomId).emit('syncPlayback', action)
  }

  @SubscribeMessage('endPlayback') 
  async handleEndPlayback(@ConnectedSocket() client: Socket) {
    this.validateToken(client);
    let roomId = client.data.roomId;

    client.to(roomId).emit('endPlayback');
  }
}