import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';

import { VideoControls } from "../components/VideoControls"

import { useUserStore } from '@/stores/userStore';
import { useCaptionStore } from "@/stores/captionsStore"
import { useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { usePartyStore } from '@/stores/partyStore';
import { Captions } from "@vidstack/react";
import { useVideoData } from '@/lib/query-client';


export function VideoPlayer() {
    
    const user = useUserStore()
    const { styles } = useCaptionStore()
    const { id } = useParams<{ id: string }>();
    
    const player = useRef<MediaPlayerInstance>(null);

    const { data: current } = useVideoData(id);

    const { setPlayer } = usePartyStore();

    useEffect(() => {
        async function getVideo()
        {
            try {
                if(player.current) {
                    setPlayer(player.current);
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
        <MediaPlayer title={current.name} load="visible" src={{src: `${import.meta.env.VITE_API_URL}video/stream/${id}/master.m3u8`, type: 'application/x-mpegurl'}} className='relative w-screen h-screen flex justify-center' ref={player} onCanPlay={canPlay} keyTarget='player' crossOrigin>
            <MediaProvider />
            <Captions className="media-captions absolute bottom-0 z-50 p-4 rounded-md select-none break-words opacity-100 transition-[opacity] duration-300 media-captions:opacity-100 media-preview:opacity-0 aria-hidden:hidden"
                style={{
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    color: styles.textColor,
                    backgroundColor: styles.backgroundColor,
                    opacity: styles.backgroundOpacity,
                    bottom: styles.verticalPosition + '%'
                }}
            />
            <VideoControls name={current.name} />
        </MediaPlayer>
    )
}