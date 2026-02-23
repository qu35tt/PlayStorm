import { 
    Controls, 
    PlayButton, 
    TimeSlider, 
    useMediaState, 
    FullscreenButton, 
    SeekButton, 
    MuteButton, 
    Time, 
    VolumeSlider,
    CaptionButton,
    useMediaPlayer,
} from '@vidstack/react';
import { 
    Play, 
    Pause, 
    Minimize, 
    Maximize, 
    ArrowRight, 
    ArrowLeft, 
    VolumeX, 
    Volume1, 
    Volume2, 
    CaptionsOff,
    Captions 
} from "lucide-react";
import { useState, useRef, useEffect } from 'react';
import { usePartyStore } from '@/stores/partyStore';
import type { VideoControlsProps } from '@/types/video-data-types'
import { useNavigate } from 'react-router';
import { Button } from './ui/button';

export function VideoControls({ name }: VideoControlsProps) {   
    const player = useMediaPlayer();
    const isPaused = useMediaState('paused');
    const volume = useMediaState('volume');
    const isMuted = useMediaState('muted');
    const currentTime = useMediaState('currentTime');
    const duration = useMediaState('duration');
    const [showVolume, setShowVolume] = useState(false);
    const hideTimerRef = useRef<number | null>(null);
    const { playback_action, end_playback } = usePartyStore();

    const nav = useNavigate();

    function showVolumePop(){
        if(hideTimerRef.current){
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        setShowVolume(true);
    }

    function hideVolumePopDelayed(delay = 1200){
        if(hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => {
            setShowVolume(false);
            hideTimerRef.current = null;
        }, delay);
    }

    const handlePlay = () => {
        player?.remoteControl.play();
        playback_action({action: 'PLAY'});
    };

    const handlePause = () => {
        player?.remoteControl.pause();
        playback_action({action: 'PAUSE'});
    };

    const handleSeekFrw = () => {
        if (!player) return;
        const newTime = Math.min(currentTime + 10, duration);
        player.currentTime = newTime;
        playback_action({ action: 'SEEK_TO', time: newTime });
    };

    const handleSeekBck = () => {
        if (!player) return;
        const newTime = Math.max(currentTime - 10, 0);
        player.currentTime = newTime;
        playback_action({ action: 'SEEK_TO', time: newTime });
    }

    const handleSeekCommit = (e: any) => {
        if (!player) return;
        const newTime = e.detail;
        player.currentTime = newTime;

        playback_action({
            action: 'SEEK_TO', 
            time: newTime
        });
        
        console.log("Seeking to time (absolute): ", newTime);
    }

    const handleReturn = () => {
        end_playback();
        nav('/home')
    }
    
    useEffect(() => {
        return () => {
            if(hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        }
    }, [])

    return (
        <>
            <Controls.Root className="data-[visible]:opacity-100 absolute inset-0 z-10 flex flex-col opacity-0 transition-opacity pointer-events-none text-white bg-gradient-to-t from-black/80 via-transparent to-black/40">
                <Button 
                    className='pointer-events-auto absolute top-6 left-6 w-14 h-14 p-3 border-2 border-white/50 bg-black/20 hover:bg-white/20 rounded-full flex justify-center items-center text-white transition-all' 
                    onClick={handleReturn}
                >
                    <ArrowLeft className='w-full h-full'/> 
                </Button>

                <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none w-full px-24 text-center">
                    <h2 className="text-2xl font-bold drop-shadow-md truncate">{name}</h2>
                </div>

                <Controls.Group className="absolute bottom-0 left-0 pointer-events-auto w-full flex flex-col px-6 pb-6 pt-12">
                    {/* Time Slider above buttons */}
                    <div className="w-full mb-4">
                        <TimeSlider.Root 
                            className="group relative flex h-10 w-full items-center cursor-pointer touch-none select-none outline-none" 
                            onDragEnd={handleSeekCommit}
                        >
                            <TimeSlider.Track className="relative ring-sky-400 z-0 h-[6px] w-full rounded-sm bg-white/30 group-data-[focus]:ring-[3px]">
                                <TimeSlider.TrackFill className="bg-indigo-500 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                                <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]" />
                            </TimeSlider.Track>
                            <TimeSlider.Thumb className="absolute left-[var(--slider-fill)] top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-white shadow-md opacity-0 group-data-[active]:opacity-100 group-data-[dragging]:ring-4 transition-opacity will-change-[left]" />
                        </TimeSlider.Root>
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <PlayButton 
                                className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 transition-colors"
                                onClick={isPaused ? handlePlay : handlePause}
                            >
                                {isPaused ? <Play className='w-7 h-7 fill-white' /> : <Pause className='w-7 h-7 fill-white' />}
                            </PlayButton>

                            <SeekButton 
                                seconds={-10} 
                                onClick={handleSeekBck} 
                                className='group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 transition-colors'
                            >
                                <ArrowLeft className='w-6 h-6'/>
                            </SeekButton>

                            <SeekButton 
                                seconds={10} 
                                onClick={handleSeekFrw} 
                                className='group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 transition-colors'
                            >
                                <ArrowRight className='w-6 h-6'/>
                            </SeekButton>

                            <div className="flex items-center gap-2 ml-2 font-mono text-sm">
                                <Time type="current" />
                                <span className="text-white/50">/</span>
                                <Time type="duration" />
                            </div>

                            <div
                                className="relative inline-flex items-center ml-2"
                                onMouseEnter={showVolumePop}
                                onMouseLeave={() => hideVolumePopDelayed()}
                            >
                                <MuteButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 transition-colors">
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className='w-6 h-6'/>
                                    ) : volume < 0.5 ? (
                                        <Volume1 className='w-6 h-6'/>
                                    ) : (
                                        <Volume2 className='w-6 h-6'/>
                                    )}
                                </MuteButton>
                                <div
                                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-3 bg-black/80 rounded-lg transition-opacity ${showVolume ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                >
                                    <VolumeSlider.Root
                                        className="group relative inline-flex w-6 h-24 cursor-pointer touch-none select-none items-center justify-center outline-none"
                                        orientation="vertical"
                                    >
                                        <VolumeSlider.Track className="relative w-1.5 h-full rounded-full bg-white/20 mx-auto">
                                            <VolumeSlider.TrackFill className="bg-indigo-500 absolute bottom-0 left-0 w-full h-[var(--slider-fill)] rounded-full will-change-[height]" />
                                        </VolumeSlider.Track>
                                        <VolumeSlider.Thumb className="absolute left-1/2 bottom-[var(--slider-fill)] z-20 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-white opacity-0 group-data-[active]:opacity-100 transition-opacity will-change-[bottom]" />
                                    </VolumeSlider.Root>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center gap-4'>
                            <CaptionButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 transition-colors">
                                <Captions className="w-6 h-6 opacity-50 group-data-[active]:opacity-100" /> 
                            </CaptionButton>
                            <FullscreenButton className="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 transition-colors">
                                <Maximize className="w-6 h-6 group-data-[active]:hidden" />
                                <Minimize className="w-6 h-6 hidden group-data-[active]:block" />
                            </FullscreenButton>
                        </div>
                    </div>
                </Controls.Group>
            </Controls.Root>
        </>
    );
}