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
        <MediaPlayer title={current.name} load="visible" src={current.URL} className='realtive w-screen h-screen'>
            <MediaProvider />
            <VideoControls name={current!.name} />
        </MediaPlayer>
    )
}