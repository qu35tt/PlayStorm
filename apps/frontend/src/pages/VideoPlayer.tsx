import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';

import { VideoControls } from "../components/VideoControls"

import { useUserStore } from '@/stores/userStore';
import { useCaptionStore } from "@/stores/captionsStore"
import { useNavigate, useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { usePartyStore } from '@/stores/partyStore';
import { Captions } from "@vidstack/react";
import { useVideoData, saveProgress, setVideoData } from '@/lib/query-client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';


export function VideoPlayer() {
    
    const user = useUserStore()
    const { styles } = useCaptionStore()
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    
    const player = useRef<MediaPlayerInstance>(null);
    const lastSavedTime = useRef<number>(0);
    const [showNextOverlay, setShowNextOverlay] = useState(false);

    const { data: current } = useVideoData(id);

    const { setPlayer, startPlayback, roomId, syncState, bufferingStatus } = usePartyStore();

    useEffect(() => {
        if (!roomId || !player.current) return;

        const interval = setInterval(() => {
            if (player.current) {
                syncState({
                    time: player.current.currentTime,
                    isPlaying: !player.current.paused
                });
            }
        }, 5000); // Heartbeat every 5 seconds

        return () => clearInterval(interval);
    }, [roomId, syncState]);

    const handleWaiting = () => {
        if (roomId) bufferingStatus(true);
    };

    const handleCanPlay = () => {
        if (roomId) bufferingStatus(false);
        setPlayer(player.current);
    };

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

    const handleTimeUpdate = (detail: any) => {
        const currentTime = detail.currentTime;
        const duration = player.current?.state.duration || 0;

        if (Math.abs(currentTime - lastSavedTime.current) > 5) {
            lastSavedTime.current = currentTime;
            if (current && id) {
                const isFinished = duration > 0 && currentTime > duration - 30;
                
                // Show overlay for series if near end
                if (isFinished && current.videotype === 'SERIES' && !showNextOverlay) {
                    const next = getNextEpisode();
                    if (next) setShowNextOverlay(true);
                }

                saveProgress(user.token!, {
                    videoId: current.videotype === 'MOVIE' ? id : undefined,
                    episodeId: current.videotype === 'SERIES' ? id : undefined,
                    position: Math.floor(currentTime),
                    isFinished
                });
                // REMOVED: invalidateData("video-data") 
                // Invaliding here causes a refetch loop that breaks seeking
            }
        }
    }

    // Reset overlay when episode changes
    useEffect(() => {
        setShowNextOverlay(false);
        lastSavedTime.current = 0;
    }, [id]);

    const getNextEpisode = () => {
        if (!current || current.videotype !== 'SERIES' || !current.seasons) return null;

        const currentSeason = current.seasons.find(s => s.number === current.seasonNumber);
        const nextInCurrentSeason = currentSeason?.episodes.find(
            ep => ep.number === (current.episodeNumber || 0) + 1
        );

        if (nextInCurrentSeason) return { episode: nextInCurrentSeason, season: currentSeason };

        const nextSeason = current.seasons.find(s => s.number === (current.seasonNumber || 0) + 1);
        if (nextSeason && nextSeason.episodes.length > 0) {
            const firstEpisode = [...nextSeason.episodes].sort((a, b) => a.number - b.number)[0];
            return { episode: firstEpisode, season: nextSeason };
        }

        return null;
    };

    const handleEnded = () => {
        const next = getNextEpisode();
        if (next && current) {
            const { episode, season } = next;
            
            setVideoData(episode.id, {
                ...episode,
                name: `${current.seriesName || current.name.split(' - ')[0]} - ${episode.title}`,
                banner: episode.thumbnail || current.banner,
                videotype: 'SERIES',
                genre: current.genre,
                rls_year: current.rls_year,
                seriesName: current.seriesName || current.name.split(' - ')[0],
                episodeTitle: episode.title,
                episodeNumber: episode.number,
                seasonNumber: season?.number,
                seasons: current.seasons
            });

            nav(`/watch/${episode.id}`);
            if (roomId) startPlayback(episode.id);
        }
    };

    if(!current)
        return <h1>Loading ...</h1>
    
    return(
        <MediaPlayer 
            key={id}
            title={current.name} 
            load="visible" 
            src={{src: `${import.meta.env.VITE_API_URL}video/stream/${id}/master.m3u8`, type: 'application/x-mpegurl'}} 
            className='relative w-screen h-screen flex justify-center' 
            ref={player} 
            onCanPlay={handleCanPlay} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onWaiting={handleWaiting}
            keyTarget='player' 
            crossOrigin
            currentTime={current.watchProgress && !current.watchProgress.isFinished ? current.watchProgress.last_position : 0}
        >
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
            
            {showNextOverlay && (
                <div className="absolute bottom-24 right-8 z-50 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-black/80 border border-white/20 p-6 rounded-lg backdrop-blur-md shadow-2xl flex flex-col gap-4 min-w-[300px]">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Up Next</span>
                            <span className="text-white text-xl font-bold truncate">
                                {getNextEpisode()?.episode.title}
                            </span>
                        </div>
                        <Button 
                            className="bg-white text-black hover:bg-gray-200 font-bold py-6 text-lg flex items-center gap-2"
                            onClick={handleEnded}
                        >
                            <ArrowRight className="w-6 h-6" /> Play Next
                        </Button>
                    </div>
                </div>
            )}
        </MediaPlayer>
    )
}