import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';

import { VideoControls } from "../components/VideoControls"

import axios from "axios"

import { useUserStore } from '@/stores/userStore';
import { useCaptionStore } from "@/stores/captionsStore"
import { useParams } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { usePartyStore } from '@/stores/partyStore';
import type { Video } from "@/types/video-data-types";
import { Captions } from "@vidstack/react";


export function VideoPlayer() {
    
    const user = useUserStore()
    const { styles } = useCaptionStore()
    const { id } = useParams<{ id: string }>();

    const [current, setCurrent] = useState<Video | null>(null);
    
    const player = useRef<MediaPlayerInstance>(null);

    const { setRemote } = usePartyStore();

    useEffect(() => {
        async function getVideo()
        {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}video/stream/${id}`,  { headers: { Authorization: `Bearer ${user.token}` } })
                setCurrent(response.data);
                if(player.current) {
                    setRemote(player.current.remoteControl)
                }
            }
            catch(err){
                console.error(err);
            }
        }
        
        if(id) getVideo()

    }, [id, user.token])

    function canPlay() {
        
    }

    if(!current)
        return <h1>Loading ...</h1>
    
    return(
        <MediaPlayer title={current.name} load="visible" src={{src: `${import.meta.env.VITE_MEDIA_SERVER}/${id}/master.m3u8`, type: 'application/x-mpegurl'}} className='relative w-screen h-screen flex justify-center' ref={player} onCanPlay={canPlay} keyTarget='player' crossOrigin>
            <MediaProvider />
            <Captions className="media-captions absolute bottom-1/12 z-50 p-4 rounded-md select-none break-words opacity-100 transition-[opacity] duration-300 media-captions:opacity-100 media-preview:opacity-0 aria-hidden:hidden"
                style={{
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    color: styles.textColor,
                    backgroundColor: styles.backgroundColor
                }}
            />
            <VideoControls name={current.name} />
        </MediaPlayer>
    )
}