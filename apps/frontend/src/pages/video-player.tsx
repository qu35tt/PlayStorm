import '@vidstack/react/player/styles/base.css';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';

import { VideoControls } from "../components/video-controls"

import { useUserStore } from '@/stores/user-store';
import { useCaptionStore } from "@/stores/captions-store"
import { useNavigate, useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { usePartyStore } from '@/stores/party-store';
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

    const { data: currentVideo } = useVideoData(id);

    const { setPlayer, startPlayback, roomId, syncState, bufferingStatus } = usePartyStore();

    /*
        * * Initializing Functions
    */

    useEffect(() => {
        if (!roomId || !player.current) return;

        const interval = setInterval(() => {
            if (player.current) {
                syncState({
                    time: player.current.currentTime,
                    isPlaying: !player.current.paused
                });
            }
        }, 12000);

        return () => clearInterval(interval);
    }, [roomId, syncState]);

    useEffect(() => {
        if(player.current) {
            setPlayer(player.current);
        }
        setShowNextOverlay(false);
        lastSavedTime.current = 0;

        return () => {
            setPlayer(null as any);
        };
    }, [id, setPlayer]);

    /*
        * * Handler Functions
    */

    function handleWaiting() {
        if (roomId) bufferingStatus(true);
    }

    function handleCanPlay() {
        if (roomId) bufferingStatus(false);
        
        if(player.current) {
            setPlayer(player.current);
        }
    };

    function handleEnded () {
        if (!currentVideo || currentVideo.videotype !== 'SERIES' && currentVideo.videotype !== 'MOVIE' || !currentVideo.seasons) return null;
 
        saveProgress(user.token!, {
            videoId: currentVideo.videotype === 'MOVIE' ? id : undefined,
            episodeId: currentVideo.videotype === 'SERIES' ? id : undefined,
            position: Math.floor(currentVideo.length || 0),
            isFinished: true
        })
        
        const next = getNextEpisode();
        if (next && currentVideo) {
            const { episode, season } = next;
            
            setVideoData(episode.id, {
                ...episode,
                name: `${currentVideo.seriesName || currentVideo.name.split(' - ')[0]} - ${episode.title}`,
                banner: episode.thumbnail || currentVideo.banner,
                videotype: 'SERIES',
                genre: currentVideo.genre,
                rls_year: currentVideo.rls_year,
                seriesName: currentVideo.seriesName || currentVideo.name.split(' - ')[0],
                episodeTitle: episode.title,
                episodeNumber: episode.number,
                seasonNumber: season?.number,
                seasons: currentVideo.seasons
            });

            nav(`/watch/${episode.id}`);
            if (roomId) startPlayback(episode.id);
        }
    };

    function handleTimeUpdate(detail: any) {
        const currentTime = detail.currentTime;
        const duration = player.current?.state.duration || 0;

        if (Math.abs(currentTime - lastSavedTime.current) > 5) {
            lastSavedTime.current = currentTime;
            if (currentVideo && id) {
                const isFinished = duration > 0 && currentTime > duration - 30;
                
                // Show overlay for series if near end
                if (isFinished && currentVideo.videotype === 'SERIES' && !showNextOverlay) {
                    const next = getNextEpisode();
                    if (next) setShowNextOverlay(true);
                }

                saveProgress(user.token!, {
                    videoId: currentVideo.videotype === 'MOVIE' ? id : undefined,
                    episodeId: currentVideo.videotype === 'SERIES' ? id : undefined,
                    position: Math.floor(currentTime),
                    isFinished
                });
            }
        }
    }

    /*
        * * Getters
    */

    function getNextEpisode() {
        if (!currentVideo || currentVideo.videotype !== 'SERIES' || !currentVideo.seasons) return null;

        const currentSeason = currentVideo.seasons.find(s => s.number === currentVideo.seasonNumber);
        const nextInCurrentSeason = currentSeason?.episodes.find(
            ep => ep.number === (currentVideo.episodeNumber || 0) + 1
        );

        if (nextInCurrentSeason) return { episode: nextInCurrentSeason, season: currentSeason };

        const nextSeason = currentVideo.seasons.find(s => s.number === (currentVideo.seasonNumber || 0) + 1);
        if (nextSeason && nextSeason.episodes.length > 0) {
            const firstEpisode = [...nextSeason.episodes].sort((a, b) => a.number - b.number)[0];
            return { episode: firstEpisode, season: nextSeason };
        }

        return null;
    };

    if(!currentVideo)
        return <h1>Loading ...</h1>
    
    return(
        <MediaPlayer 
            key={id}
            title={currentVideo.name} 
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
            currentTime={currentVideo.watchProgress && !currentVideo.watchProgress.isFinished ? currentVideo.watchProgress.last_position : 0}
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
            <VideoControls id={id} />
            
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