import { VideoModal } from "@/components/modals/video-modal";
import { ProfileModal } from "@/components/modals/profile-modal";
import { PartyModal } from "@/components/modals/party-modal";
import { useEffect, useState } from "react";

export function ModalProvider() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if(!isMounted) return null; 

    return(
        <>
            <VideoModal />
            <ProfileModal />
            <PartyModal />
        </>
    )
}