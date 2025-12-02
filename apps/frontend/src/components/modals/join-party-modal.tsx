import { usePartyStore } from "@/stores/partyStore";
import { useModal } from "../../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { toast } from "sonner";

export function JoinPartyModal() {
    const { isOpen, onClose, onOpen, type } = useModal();
    const { joinParty } = usePartyStore();
     const [partyCode, setPartyCode] = useState("");

    const isModalOpen = isOpen && type === 'joinParty';

    async function handleJoin(){
        try {
            await joinParty(partyCode);

            onClose();
            onOpen("party", "");
            toast.success("Jsi připojen v partě!");

        } catch (error) {
            console.error("Failed to join party:", error);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent
                forceMount
                className="w-1/4 h-1/4"
            >
                <DialogHeader>
                    <h2
                        className="font-bold text-3xl text-center"
                    >
                        Join Party!
                    </h2>
                    <div className="w-full h-full flex items-center justify-center flex-col space-y-6">
                        <div className="w-3/4 flex flex-col items-start space-y-2">
                            <Label className="text-left">Party Code:</Label>
                            <Input className="w-full" value={partyCode} onChange={(e) => setPartyCode(e.target.value)} placeholder="Enter party code"/>
                        </div>
                        <Button className="w-1/4 h-12" onClick={handleJoin}>Join!</Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}