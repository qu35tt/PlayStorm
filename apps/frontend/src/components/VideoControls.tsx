import { Controls, PlayButton, TimeSlider, useMediaState, FullscreenButton, SeekButton, MuteButton, Time } from '@vidstack/react';
import { Play, Pause, Minimize, Maximize, ArrowRight, ArrowLeft, VolumeX, Volume1, Volume2 } from "lucide-react";

type VideoControlsProps = {
  name: string;
};

export function VideoControls({ name }: VideoControlsProps) {  
    const isPaused = useMediaState('paused');
    const volume = useMediaState('volume'),
    isMuted = useMediaState('muted');

    return (
        <>
        
            <Controls.Root className="data-[visible]:opacity-100 absolute bottom-0 left-0 z-10 w-full h-[5rem] flex flex-col bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity pointer-events-none text-white">
                <Controls.Group className="pointer-events-auto w-full flex items-center px-4 py-2 gap-4">
                    <PlayButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                        {isPaused ? <Play className='w-8 h-8'/> : <Pause className='w-8 h-8'/>}
                    </PlayButton>
                    <SeekButton seconds={-10} className='group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden'>
                        <ArrowLeft className='w-8 h-8'/>
                    </SeekButton>
                    <SeekButton seconds={10} className='group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden'>
                        <ArrowRight className='w-8 h-8'/>
                    </SeekButton>
                    <MuteButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
                            {isMuted || volume == 0 ? (
                                <VolumeX className='w-8 h-8'/>
                            ) : volume < 0.5 ? (
                                <Volume1 className='w-8 h-8'/>
                            ) : (
                                <Volume2 className='w-8 h-8'/>
                            )}
                    </MuteButton>
                    <TimeSlider.Root className="absolute left-4 right-4 -top-2 transform -translate-y-1/2 h-10 z-20 flex items-center gap-4 cursor-pointer touch-none select-none outline-none aria-hidden:hidden">
                        <Time type="current" className="font-bold text-white text-center" />
                        <TimeSlider.Track className="relative ring-sky-400 z-0 h-[8px] flex-1 rounded-sm bg-white/30 group-data-[focus]:ring-[3px]">
                            <TimeSlider.TrackFill className="bg-indigo-400 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                            <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]" />
                        </TimeSlider.Track>
                        <Time type="duration" className="font-bold text-white text-center" />
                    </TimeSlider.Root>
                    <h2 className="w-screen flex justify-center items-center text-3xl font-semibold py-2">{name}</h2>  
                    <FullscreenButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-end rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden'">
                        <Maximize className="w-8 h-8 group-data-[active]:hidden" />
                        <Minimize className="w-8 h-8 hidden group-data-[active]:block" />
                    </FullscreenButton>
                </Controls.Group>
            </Controls.Root>
        </>
    );
}