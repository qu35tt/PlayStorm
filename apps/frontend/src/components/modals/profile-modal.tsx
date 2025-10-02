import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";
import { User } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

type profileData = {

}

export function ProfileModal() {
    const user = useUserStore();
    const { isOpen, onClose, type, videoId } = useModal();
    const [data, setData] = useState<profileData | null>();

    const isModalOpen = isOpen && type === "profile";

    useEffect(() => {
        setData(null);
        async function getData(){
        const response = await axios.get(`${import.meta.env.VITE_API_URL}video/data/${videoId}`, { headers: { Authorization: `Bearer ${user.token}` } })
        setData(response.data);
        }

        if (videoId) {
        getData();
        }
    }, [user.userId, user.token])
    
    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-full w-3/4 bg-[#0F2340] text-white p-0 m-0 overflow-hidden border-0">
                <DialogHeader className="w-full h-[70rem] m-0 p-0 flex flex-row">
                    <div className="w-1/4 h-full border-amber-100 border-2">
                        <ul className="w-3/4 h-full flex flex-col items-center mx-auto py-4">
                            <li className="w-full h-8 flex flex-row items-center justify-between py-8 text-2xl cursor-pointer rounded-md hover:bg-gray-600/15">
                                <User className="w-6 h-6 mx-4" />
                                <span className="flex-1 text-center">Profile</span>
                                <div className="w-6"></div>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full h-full border-amber-100 border-2">
                        
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}