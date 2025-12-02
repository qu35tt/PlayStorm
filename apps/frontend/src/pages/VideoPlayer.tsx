import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';

import { VideoControls } from "../components/VideoControls"

import axios from "axios"

import { useUserStore } from '@/stores/userStore';
import { useParams } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { usePartyStore } from '@/stores/partyStore';



type Video = {
    name: string,
    URL: string
}



export function VideoPlayer() {
    
    const user = useUserStore()
    const id = useParams<{ id: string }>();

    const [current, setCurrent] = useState<Video | null>(null);
    
    let player = useRef<MediaPlayerInstance>(null);

    player.current?.remoteControl.setTarget(player.current)

    const { setRemote } = usePartyStore();

    

    useEffect(() => {
        async function getVideo()
        {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}video/stream/${id.id}`,  { headers: { Authorization: `Bearer ${user.token}` } })
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
    }, [id, current])

    function canPlay() {
        
    }

    if(!current)
        return <h1>Loading ...</h1>
    
    return(
        <MediaPlayer title={current.name} load="visible" src={current.URL} className='realtive w-screen h-screen' ref={player} onCanPlay={canPlay}>
            <MediaProvider />
            <VideoControls name={current!.name} />
        </MediaPlayer>
    )
}