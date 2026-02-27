import { Injectable } from '@nestjs/common';
import { DisconnectResult ,PartyUser } from './dto'

@Injectable()
export class RoomManagementService {
    private rooms = new Map<string, { hostId: string, users: Map<string, PartyUser> }>();

    private socketToRoom = new Map<string, {roomId: string, user: PartyUser}>();

    public doesRoomExist(roomId: string): boolean {
        return this.rooms.has(roomId);
    }

    public getRoomHost(roomId: string): string | undefined {
        return this.rooms.get(roomId)?.hostId;
    }

    public addUserToRoom(roomId: string, user: PartyUser, socketId: string): PartyUser[] {
        let room = this.rooms.get(roomId);

        if (!room) {
            // First user is host
            room = { hostId: user.id, users: new Map() };
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
        const isHost = room.hostId === user.id;

        // Only remove if the specific user reference exists (handles re-joins gracefully)
        const currentUser = roomUsers.get(user.id);

        if(currentUser === user){
            roomUsers.delete(user.id);
        } else {
            // If user reference is not in set (replaced by re-join), just clean up socket map
            this.socketToRoom.delete(socketId);
            return null;
        }

        let newHostId: string | undefined = undefined;
        if (isHost && roomUsers.size > 0) {
            // Assign next available user as host
            newHostId = Array.from(roomUsers.keys())[0];
            room.hostId = newHostId;
        }

        if(roomUsers.size === 0) {
            this.rooms.delete(roomId);
        }

        this.socketToRoom.delete(socketId);

        return {
            roomId,
            user,
            updatedUserList: Array.from(roomUsers.values()),
            newHostId
        }
    }

    public getUsersInRoom(roomId: string): PartyUser[] {
        const room = this.rooms.get(roomId);
        if (!room) {
            return []; // Return empty array if room is unknown
        }
        return Array.from(room.users.values());
    }

    // public async findSocketIdByUserId(userId: string): Promise<string | null> {
    //     // Iterate over the [socketId, { roomId, user }] entries
    //     for (const [socketId, data] of this.socketToRoom.entries()) {
    //         if (data.user.id === userId) {
    //             return socketId;
    //         }
    //     }
    //     return null;
    // }
}