import { Injectable } from '@nestjs/common';
import { DisconnectResult ,PartyUser } from './dto'

@Injectable()
export class RoomManagementService {
    private rooms = new Map<string, { users: Map<string, PartyUser> }>();

    private socketToRoom = new Map<string, {roomId: string, user: PartyUser}>();

    public doesRoomExist(roomId: string): boolean {
        return this.rooms.has(roomId);
    }

    public addUserToRoom(roomId: string, user: PartyUser, socketId: string): PartyUser[] {
        let room = this.rooms.get(roomId);

        if (!room) {
            room = { users: new Map() };
            this.rooms.set(roomId, room);
        }
        
        room.users.set(user.id, user);

        this.socketToRoom.set(socketId, { roomId, user })

        return Array.from(room.users.values());
    }

    public removeUserBySocketId(socketId: string) : DisconnectResult | null {
        const roomData = this.socketToRoom.get(socketId);

        if(!roomData) return null;

        const { roomId, user } = roomData;

        const room = this.rooms.get(roomId);

        if(!room) {
            this.socketToRoom.delete(socketId);
            return null;
        }

        const roomUsers = room.users;

        // Only remove if the specific user reference exists (handles re-joins gracefully)
        const currentUser = roomUsers.get(user.id);

        if(currentUser === user){
            roomUsers.delete(user.id);
        } else {
            // If user reference is not in set (replaced by re-join), just clean up socket map
            this.socketToRoom.delete(socketId);
            return null;
        }

        if(roomUsers.size === 0) {
            this.rooms.delete(roomId);
        }

        this.socketToRoom.delete(socketId);

        return {
            roomId,
            user,
            updatedUserList: Array.from(roomUsers.values())
        }
    }

    public getUsersInRoom(roomId: string): PartyUser[] {
        const room = this.rooms.get(roomId);
        if (!room) {
            return []; // Return empty array if room is unknown
        }
        return Array.from(room.users.values());
    }

    public getSocketIdByUserId(userId: string): string | undefined {
        for (const [socketId, data] of this.socketToRoom.entries()) {
            if (data.user.id === userId) {
                return socketId;
            }
        }
        return undefined;
    }
}