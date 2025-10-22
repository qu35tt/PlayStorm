import { useUserStore } from "../../stores/userStore";
import { useModal } from "../../hooks/use-modal-store";
import { useSocket } from "@/context/socket-context";
import { useWatchPartyStore } from "@/stores/socketStore";

import { MemberCard } from "../MemberCard"
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../ui/dialog";

export function PartyModal(){
    const user = useUserStore();
    const { isOpen, onClose, type } = useModal();
    const socket = useSocket();

    // Select state and actions separately
    const roomId = useWatchPartyStore((state) => state.roomId);
    const setPartyDetails = useWatchPartyStore((state) => state.setPartyDetails);

    const isModalOpen = isOpen && type === "party";

    useEffect(() => {
        // Only run this logic if the modal is open, the socket is connected, and we haven't joined this room yet.
        if (isModalOpen && socket && roomId !== "dsdasfsagaf5s26s2621") {
            const partyRoomId = "dsdasfsagaf5s26s2621";
            const videoId = "0b1c2d3e-4f5g-6h7i-8j9k-0l1m2n3o4p5q";

            // A. Update the local state (Zustand)
            setPartyDetails(partyRoomId, videoId);

            // B. Emit the 'join' event to the server
            socket.emit('join', { 
                roomId: partyRoomId, 
                videoId: videoId 
            });

            console.log(`Emitting 'join' for room: ${partyRoomId}`);

            socket.on('initpartystate', (data) => {console.log("prichozi data", data)})
        }
    // The dependency array now correctly tracks only the values that should trigger the effect.
    // We can safely omit `setPartyDetails` as it's a stable function from Zustand.
    }, [isModalOpen, socket, roomId]);

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