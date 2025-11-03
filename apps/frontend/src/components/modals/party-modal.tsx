import { useUserStore } from "../../stores/userStore";
import { useModal } from "../../hooks/use-modal-store";
import { useUser } from '../../context/user-context';
import type { RoomUser } from "@/types/socket-types";

import { MemberCard } from "../MemberCard"
import { useState ,useEffect } from "react";
import {v4 as uuidv4} from 'uuid';

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../ui/dialog";
import { useSocket } from "@/context/socket-context";

export function PartyModal(){
    const user = useUserStore();
    const { isOpen, onClose, type } = useModal();
    const socket = useSocket()
    const { userCredentials } = useUser();

    // Select state and actions separately
    const isModalOpen = isOpen && type === "party";

    const [roomId, setRoomId] = useState<string | null>(null);
    const [users, setUsers] = useState<RoomUser[]>([]);

  useEffect(() => {
    if (isModalOpen && userCredentials && !socket.connected) {
      
      const newRoomId = "kys";
      setRoomId(newRoomId);

      
      const onConnect = () => {
        console.log(`Socket connected: ${socket.id}`);
        socket.emit('join', {
          roomId: newRoomId,
          videoId: "some-default-video-id",
          user: userCredentials
        });
      };

      
      const onInitPartyState = (state: { users: RoomUser[] }) => {
        setUsers(state.users);
      };

      const onUserJoined = (user: RoomUser) => {
        console.log(`User joined: ${user.username}`);
        setUsers((prevUsers) => [...prevUsers, user]);
      };

      const onUserLeft = (socketId: string) => {
        console.log(`User left: ${socketId}`);
        setUsers((prevUsers) => prevUsers.filter(u => u.socketId !== socketId));
      };

      const onRoomUsersList = (userList: RoomUser[]) => {
        console.log("Received refreshed user list:", userList);
        setUsers(userList);
      };

      socket.on('connect', onConnect);
      socket.on('initpartystate', onInitPartyState);
      socket.on('userJoined', onUserJoined);
      socket.on('userLeft', onUserLeft);
      socket.on('roomUsersList', onRoomUsersList);

      socket.connect();
    }
    else {

      const onRoomUsersList = (userList: RoomUser[]) => {
        console.log("Received refreshed user list:", userList);
        setUsers(userList);
      };

      socket.on('roomUsersList', onRoomUsersList);

      if (roomId) {
          console.log("Modal re-opened. Fetching user list...");
          socket.emit('listRoomUsers', { roomId }); // ✅ This now works
        } else {
          console.warn("Modal re-opened, but no roomId in state.");
          // This can happen if the state was lost. You might need
          // to store roomId in Zustand (like we discussed earlier).
        }
    } 

    return () => {
      if (!isModalOpen) {
        console.log("Cleaning up socket...");
        // socket.off('connect');
        // socket.off('initpartystate');
        // socket.off('userJoined');
        // socket.off('userLeft');
        
        
        // if (socket.connected) {
        //   socket.disconnect();
        // }
        
        // Reset local state
        setUsers([]);
      }
    };
  }, [isModalOpen]);

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="w-3/4 h-3/4 p-4">
                <DialogHeader>
                    <h2 className="font-bold text-3xl text-center">Party Menu</h2>
                    <p className="text-gray-500/65 text-sm text-center">ID: {user.userId}</p>
                    <div className="h-full flex flex-row space-x-4">
                        <div className="w-full h-full border-red-900 border-1 p-4">
                            <MemberCard />
                            
                        </div>
                        <div className="w-full h-full border-red-900 border-1">
                            <h1>Chat</h1>
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}