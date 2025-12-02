import { Injectable } from '@nestjs/common';
import { DisconnectResult ,PartyUser } from './dto'

@Injectable()
export class RoomManagmentService {
    private rooms = new Map<string, Set<PartyUser>>();

    private socketToRoom = new Map<string, {roomId: string, user: PartyUser}>();

    public addUserToRoom(roomId: string, user: PartyUser, socketId: string): PartyUser[] {
        const userSet = this.rooms.get(roomId) || new Set<PartyUser>();
        userSet.add(user);
        this.rooms.set(roomId, userSet);

        this.socketToRoom.set(socketId, { roomId, user })

        return Array.from(userSet);
    }

    public removeUserBySocketId(socketId: string) : DisconnectResult | null {
        const roomData = this.socketToRoom.get(socketId);

        if(!roomData) return null;

        const { roomId, user } = roomData;

        const userSet = this.rooms.get(roomId);

        if(!userSet) return null;

        let userToRemove: PartyUser | undefined;
        for (const u of userSet) {
            if(u.username === user.username){
                userToRemove = u;
                break;
            }
        }

        if(userToRemove){
            userSet.delete(userToRemove);
        }

        if(userSet.size === 0) {
            this.rooms.delete(roomId);
        }
        else {
            this.rooms.set(roomId, userSet)
        }

        this.socketToRoom.delete(socketId);

        return {
            roomId,
            user,
            updatedUserList: Array.from(userSet)
        }
    }

        public getUsersInRoom(roomId: string): PartyUser[] {
        const userSet = this.rooms.get(roomId);
        if (!userSet) {
            return []; // Return empty array if room is unknown
        }
        return Array.from(userSet);
    }
}