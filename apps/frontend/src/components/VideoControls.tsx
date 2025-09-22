import { Controls, PlayButton, TimeSlider, useMediaState, FullscreenButton, SeekButton } from '@vidstack/react';
import { Play, Pause, Minimize, Maximize, ArrowRight, ArrowLeft } from "lucide-react";

export function VideoControls() {  
    const isPaused = useMediaState('paused');

    return (
        <>
            <Controls.Root className="data-[visible]:opacity-100 absolute bottom-0 left-0 z-10 w-full h-[5rem] flex flex-col bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity pointer-events-none">
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
                    <TimeSlider.Root className="absolute left-4 right-4 -top-0 transform -translate-y-1/2 h-10 z-20 cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden">
                        <TimeSlider.Track className="relative ring-sky-400 z-0 h-[8px] w-full rounded-sm bg-white/30 group-data-[focus]:ring-[3px]">
                            <TimeSlider.TrackFill className="bg-indigo-400 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
                            <TimeSlider.Progress className="absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]" />
                        </TimeSlider.Track>
                    </TimeSlider.Root>
                    <h2 className="w-screen flex justify-center items-center text-3xl font-semibold py-2">Track Name</h2>  
                    <FullscreenButton className="group ring-sky-400 relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4 aria-hidden:hidden'">
                        <Maximize className="w-8 h-8 group-data-[active]:hidden" />
                        <Minimize className="w-8 h-8 hidden group-data-[active]:block" />
                    </FullscreenButton>
                      
                </Controls.Group>
            </Controls.Root>
            
        </>
    );
}