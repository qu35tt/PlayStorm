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
}