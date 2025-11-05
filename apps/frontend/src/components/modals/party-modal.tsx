import { useModal } from "../../hooks/use-modal-store";
import { MemberCard } from "../MemberCard";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { usePartyStore } from "@/stores/partyStore";
import { useUser } from "@/context/user-context"; // <-- 1. Importuj useUser
import { useSocket } from "@/context/socket-context"; // <-- 2. Importuj useSocket
import { useEffect } from "react";

export function PartyModal() {
const { isOpen, onClose, type } = useModal();
const { roomId, users } = usePartyStore();
const { userCredentials } = useUser(); // <-- 3. Získej svá data
const socket = useSocket(); // <-- 4. Získej socket pro své ID

const isModalOpen = isOpen && type === "party";

  useEffect(() => {
    if (isModalOpen && roomId && socket.connected) {
      console.log("Requesting roomUsersList for room:", roomId);
      socket.emit("listRoomUsers", { roomId });
    }
  }, [isModalOpen, roomId, socket]);

return (
 <Dialog open={isModalOpen} onOpenChange={onClose}>
 <DialogContent forceMount className="w-3/4 h-3/4 p-4">
 <DialogHeader>
 <h2 className="font-bold text-3xl text-center">Party Menu</h2>
 <p className="text-gray-500/65 text-sm text-center">
      ID: {roomId || "Not in a party"}
     </p>
     <div className="h-full flex flex-row space-x-4">
      <div className="w-full h-full border-red-900 border-1 p-4 space-y-2 overflow-y-auto"> 
              {userCredentials && (
                <MemberCard 
                  user={{ 
                    ...userCredentials, 
                    socketId: socket.id || 'self' 
                  }} 
                />
              )}
          {(users || [])
            .filter((u) => u.socketId !== socket.id)
            .map((user) => (
              <MemberCard key={user.socketId} user={user} />
            ))}
      </div>
      <div className="w-full h-full border-red-900 border-1">
       <h1>Chat</h1>
      </div>
     </div>
    </DialogHeader>
   </DialogContent>
  </Dialog>
 );
}

