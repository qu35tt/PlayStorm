import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';

import { VideoControls } from "../components/VideoControls"

import axios from "axios"

import { useUserStore } from '@/stores/userStore';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';

type Video = {
    name: string,
    URL: string
}



export function VideoPlayer() {
    
    const user = useUserStore()
    const id = useParams<{ id: string }>();

    const [current, setCurrent] = useState<Video | null>(null);

    useEffect(() => {
        async function getVideo()
        {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}video/${id.id}`,  { headers: { Authorization: `Bearer ${user.token}` } })
                setCurrent(response.data);
            }
            catch(err){
                console.error(err);
            }
        }
        
        if(id) getVideo()
    }, [id, current])

    if(!current)
        return <h1>Loading ...</h1>
    
    return(
        <MediaPlayer title="Sprite Fight" streamType="on-demand" load="visible"  src={[{src: "https://m3u8proxy-five.vercel.app/m3u8-proxy?url=https://vault-15.owocdn.top/stream/15/15/72b7cbab27a0178dc966b2ff4681df407a5b1ba4fcc8afe2252e472aee511db3/uwu.m3u8", type: "application/x-mpegurl"}]} crossOrigin="anonymous"  className='realtive w-screen h-screen'>
            <MediaProvider />
            <VideoControls name={current!.name} />
        </MediaPlayer>
    )
}