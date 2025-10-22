import { useUserStore } from "../../stores/userStore";
import { useModal } from "../../hooks/use-modal-store";

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

    // Select state and actions separately


    const isModalOpen = isOpen && type === "party";

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