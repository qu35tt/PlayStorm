import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from "uuid";
import type { JoinParty, PartyUser, PlaybackData, PlayerAction, ChatMessage } from './dto';
import { RoomManagementService } from "./room-management.service"
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'Party',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:80'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  // Track room playback state: { [roomId]: { videoId: string, currentTime: number, isPlaying: boolean } }
  private roomStates = new Map<string, { videoId: string, currentTime: number, isPlaying: boolean }>();

  // Track active sockets for each user: { [userId]: Set<socketId> }
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly roomService: RoomManagementService,
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = await this.jwtService.verifyAsync(token);
        if (payload && payload.sub) {
          const userId = payload.sub;
          client.data.userId = userId;
          
          if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
            this.userSockets.get(userId)?.add(client.id);
          }
          
          this.logger.log(`User ${userId} associated with socket ${client.id}`);
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to authenticate socket connection: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from user tracking
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      sockets?.delete(client.id);
      if (sockets?.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    const result = this.roomService.removeUserBySocketId(client.id);
    if (!result) return;

    const { roomId, user: userInfo } = result;

    this.server.to(roomId).emit('userLeft', { userInfo });
  }

  /**
   * Forces logout for a specific user by emitting 'forcedLogout' to all their sockets.
   */
  async forceLogout(userId: string) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.size > 0) {
      this.logger.log(`Forcing logout for user ${userId} on ${socketIds.size} sockets`);
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('forcedLogout', {
          message: 'User with this credentials is already logged in.'
        });
      }
    }
  }

  private async validateToken(client: Socket) {
    if (client.data.userId) return;

    const token = client.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      client.disconnect();
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
      
      const userId = payload.sub;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);
    } catch (err) {
      client.disconnect();
      throw new WsException('Unauthorized');
    }
  }

  @SubscribeMessage('createParty')
  async handlePartyCreation(@ConnectedSocket() client: Socket, @MessageBody() user: PartyUser) {
    this.logger.log(`Creating party for user: ${user.username}`);
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
    this.logger.log(`User ${data.username} joining party: ${data.roomId}`);
    await this.validateToken(client);
    const { roomId, ...userInfo } = data;

    if (!this.roomService.doesRoomExist(roomId)) {
      this.logger.warn(`Room not found: ${roomId}`);
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
    this.logger.log(`User leaving party: ${client.id}`);
    await this.validateToken(client);
    const result = this.roomService.removeUserBySocketId(client.id);
    if (!result) return;

    const { roomId, user: userInfo } = result;

    client.to(roomId).emit('userLeft', { userInfo })

    client.leave(roomId);
  }

  @SubscribeMessage('startPlayback')
  async handleStartPlayback(@ConnectedSocket() client: Socket, @MessageBody() data: PlaybackData) {
    this.logger.log(`Starting playback in room: ${client.data.roomId} for video: ${data.videoId}`);
    await this.validateToken(client);
    let roomId = client.data.roomId;
    if (!roomId) return;

    this.roomStates.set(roomId, { videoId: data.videoId, currentTime: data.currentTime, isPlaying: true });

    client.to(roomId).emit('startPlayback', {videoId: data.videoId, currentTime: data.currentTime})
  }

  @SubscribeMessage('playbackAction')
  async handlePlaybackAction(@ConnectedSocket() client: Socket, @MessageBody() action: any) {
    this.logger.log(`Playback action in room: ${client.data.roomId} action: ${action.action}`);
    await this.validateToken(client);
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
    await this.validateToken(client);
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
    this.logger.log(`Ending playback in room: ${client.data.roomId}`);
    await this.validateToken(client);
    let roomId = client.data.roomId;
    if (!roomId) return;

    this.roomStates.delete(roomId);
    client.to(roomId).emit('endPlayback');
  }
}
