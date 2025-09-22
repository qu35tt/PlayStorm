import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';

import { VideoControls } from "../components/VideoControls"


export function VideoPlayer() {
    return(
        <MediaPlayer title="Sprite Fight" src="https://www.youtube.com/watch?v=zCIyeMiIbO0" className='realtive w-screen h-screen'>
            <MediaProvider />
            <VideoControls />
        </MediaPlayer>
    )
}