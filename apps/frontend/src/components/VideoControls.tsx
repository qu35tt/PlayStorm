import { Controls, PlayButton, TimeSlider, useMediaState, FullscreenButton, SeekButton, MuteButton, Time, VolumeSlider } from '@vidstack/react';
import { Play, Pause, Minimize, Maximize, ArrowRight, ArrowLeft, VolumeX, Volume1, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from 'react';
import { usePartyStore } from '@/stores/partyStore';
import type { VideoControlsProps } from '@/types/video-data-types'

export function VideoControls({ name }: VideoControlsProps) {  
    const isPaused = useMediaState('paused');
    const volume = useMediaState('volume'),
    isMuted = useMediaState('muted');
    const [showVolume, setShowVolume] = useState(false);
    const hideTimerRef = useRef<number | null>(null);
    const playback_action = usePartyStore((state) => state.playback_action);

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
        playback_action({action: 'PLAY'});
    };

    const handlePause = () => {
        playback_action({action: 'PAUSE'});
    };

    const handleSeekFrw = () => {
        playback_action({action: 'SEEK_FRW'})
    };

    const handleSeekBck = () => {
        playback_action({action: 'SEEK_BCK'})
    }

    useEffect(() => {
        return () => {
            if(hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        }
    }, [])

    return (
        <>
            <Controls.Root className="data-[visible]:opacity-100 absolute bottom-0 left-0 z-10 w-full h-[5rem] flex flex-col from-black/60 to-transparent opacity-0 transition-opacity pointer-events-none text-white">
                <Controls.Group className="pointer-events-auto w-full flex items-center px-4 py-2 gap-4">
                    <PlayButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                        {isPaused ? <Play className='w-8 h-8' onClick={handlePlay}/> : <Pause className='w-8 h-8' onClick={handlePause}/>}
                    </PlayButton>
                    <SeekButton seconds={-10} onClick={handleSeekBck} className='group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden'>
                        <ArrowLeft className='w-8 h-8'/>
                    </SeekButton>
                    <SeekButton seconds={10} onClick={handleSeekFrw} className='group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden'>
                        <ArrowRight className='w-8 h-8'/>
                    </SeekButton>
                    <div
                        className="relative inline-flex items-center"
                        onMouseEnter={() => { showVolumePop(); }}
                        onMouseLeave={() => { hideVolumePopDelayed(); }}
                        onTouchStart={() => { showVolumePop(); }}
                        onFocus={() => { showVolumePop(); }}
                        onBlur={() => { hideVolumePopDelayed(); }}
                    >
                        <MuteButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                            {isMuted || volume == 0 ? (
                                <VolumeX className='w-8 h-8'/>
                            ) : volume < 0.5 ? (
                                <Volume1 className='w-8 h-8'/>
                            ) : (
                                <Volume2 className='w-8 h-8'/>
                            )}
                        </MuteButton>
                        <div
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 transition-opacity ${showVolume ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            onMouseEnter={() => { showVolumePop(); }}
                            onMouseLeave={() => { hideVolumePopDelayed(); }}
                        >
                            <VolumeSlider.Root
                                className="group relative inline-flex w-10 h-[6rem] max-h-[9rem] cursor-pointer touch-none select-none items-center justify-center outline-none"
                                orientation="vertical"
                            >
                                <VolumeSlider.Track className="relative ring-sky-400 z-0 w-[5px] h-full rounded-sm bg-white/30 group-data-[focus]:ring-[3px] mx-auto">
                                    <VolumeSlider.TrackFill className="bg-indigo-400 absolute bottom-0 left-0 w-full h-[var(--slider-fill)] rounded-sm will-change-[height]" />
                                </VolumeSlider.Track>
                                <VolumeSlider.Thumb className="absolute left-1/2 bottom-[var(--slider-fill)] z-20 h-[15px] w-[15px] -translate-x-1/2 translate-y-1/2 rounded-full border border-[#cacaca] bg-white opacity-0 ring-white/40 transition-opacity group-data-[active]:opacity-100 group-data-[dragging]:ring-4 will-change-[bottom]" />
                            </VolumeSlider.Root>
                        </div>
                    </div>
                    <TimeSlider.Root className="absolute left-4 right-4 -top-2 transform -translate-y-1/2 h-10 z-20 flex items-center gap-4 cursor-pointer touch-none select-none outline-none aria-hidden:hidden">
                        <Time type="current" className="font-bold text-white text-center" />
                        <TimeSlider.Track className="relative ring-sky-400 z-0 h-[8px] flex-1 rounded-sm bg-white/30 group-data-[focus]:ring-[3px]">
                            <TimeSlider.TrackFill className="bg-indigo-400 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                            <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]" />
                        </TimeSlider.Track>
                        <Time type="duration" className="font-bold text-white text-center" />
                    </TimeSlider.Root>
                    <h2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] text-center text-3xl font-semibold py-2 truncate">{name}</h2>
                    <FullscreenButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden ml-auto">
                        <Maximize className="w-8 h-8 group-data-[active]:hidden" />
                        <Minimize className="w-8 h-8 hidden group-data-[active]:block" />
                    </FullscreenButton>
                </Controls.Group>
            </Controls.Root>
        </>
    );
}