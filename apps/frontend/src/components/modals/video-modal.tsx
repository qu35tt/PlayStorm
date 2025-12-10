import { useModal } from "@/hooks/use-modal-store";
import { useNavigate } from "react-router"
import { usePartyStore } from "@/stores/partyStore";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";
import { Play, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";
import type { VideoModalData } from '@/types/video-modal.types'

export function VideoModal(){
  const nav = useNavigate();
  const user = useUserStore();

  const { start_playback } = usePartyStore();
  
  const { isOpen, onClose, type, videoId } = useModal();

  const [data, setData] = useState<VideoModalData | null>();
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState<number>(0);

  const party = usePartyStore()

  const isModalOpen = isOpen && type === "video";

  useEffect(() => {
    setData(null);
    setSelectedSeasonIndex(0);
    async function getData(){
      if(!videoId) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}video/data/${videoId}`, { headers: { Authorization: `Bearer ${user.token}` } });
        setData(response.data);
      }
      catch(err) {
        console.log(err);
      }
    }
    getData();

  }, [videoId, user.token, isModalOpen])

  function handleClick(){
    if (!data) return;

    if(data.videotype === "SERIES" && data.seasons.length > 0){
      const firstEpId = data.seasons[0].episodes[0].id;
      nav(`/watch/${firstEpId}`);
    }
    else {
      nav(`/watch/${videoId}`);
    }

    if(party.roomId){
      if (videoId) {
        start_playback(videoId);
      }
    }

    onClose();
  }

  function handleEpisodeClick(episodeId: string) {
    nav(`/watch/${episodeId}`);
    start_playback(episodeId);
    onClose();
  }

  const formatTime = (seconds: number) => Math.floor(seconds / 60) + " m"

  const isSeries = data?.videotype === 'SERIES';

  const contentHeightClass = isSeries? "h-[80vh]" : ""

  return(
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="w-3/4 bg-[#0F2340] text-white p-0 m-0 border-0">
        <div className={cn(contentHeightClass ,"overflow-y-auto")}>
          <DialogHeader className="w-full h-[30rem] m-0 p-0 bg-cover bg-bottom" style={{ backgroundImage: `url(${data?.banner ?? ""})` }}>
            <div className="w-full h-full bg-black/65 flex flex-col justify-end items-start">
              <div className="m-8 space-y-4">
                <h2 className="text-4xl font-extrabold">{data?.name}</h2>         
                <Button className="w-[10rem] bg-white hover:bg-gray-300 text-black cursor-pointer" onClick={handleClick}><Play className="w-4 h-4 "/> Play</Button>
              </div>
            </div>
          </DialogHeader>
          <DialogDescription className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 px-4 py-6">
            {/* Left Column: Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-green-500 font-bold">98% Match</span>
                <span>2024</span>
                <span className="border border-gray-500 px-1 text-xs">HD</span>
                {data?.videotype === "MOVIE" && (
                  <span className="flex flex-row gap-2 items-center"><Clock className="w-3 h-3"/> {formatTime(data.length)}</span>
                )}
              </div>
              <p className="text-gray-300">
                  {data?.description || "No description available."}
              </p>
            </div>
            {/* Right Column: Meta Info */}
            <div className="space-y-2 text-white">
              <p><span className="font-semibold">Genre: </span> {data?.genre.name}</p>
              <p><span className="font-semibold">Type: </span> {data?.videotype}</p>
            </div>
          </DialogDescription>
          {data?.videotype === "SERIES" && data.seasons.length > 0 && (
            <div className="px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold mb-4">Episodes</h3>
                {data.seasons.length > 0 && (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="min-w-[140px] justify-between border-gray-600 bg-transparent text-white hover:bg-white/10"
                                >
                                    {/* Show the name of the currently selected season */}
                                    {data.seasons[selectedSeasonIndex]?.name}
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            
                            <DropdownMenuContent align="end" className="w-[140px] bg-[#1f1f1f] border-gray-700 text-white">
                                {data.seasons.map((season, index) => (
                                    <DropdownMenuItem 
                                        key={season.id}
                                        onClick={() => setSelectedSeasonIndex(index)}
                                        className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                                    >
                                        <span className={selectedSeasonIndex === index ? "font-bold" : ""}>
                                          {season.name}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
              </div>
              <Separator className="bg-gray-800 mb-4" />

              <div className="space-y-4">
                  {data.seasons[selectedSeasonIndex]?.episodes.map((ep) => (
                    <div 
                      key={ep.id} 
                      className="group flex flex-col md:flex-row gap-4 p-4 rounded-md hover:bg-gray-400/10 cursor-pointer transition"
                      onClick={() => handleEpisodeClick(ep.id)}
                    >
                      <div className="relative min-w-[160px] w-[160px] h-[90px] bg-gray-800 rounded overflow-hidden flex-shrink-0">
                         {ep.thumbnail ? (
                           <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                         )}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <Play className="w-8 h-8 text-white fill-white" />
                         </div>
                      </div>
                      <div className="flex flex-col justify-center w-full">
                         <div className="flex justify-between items-start">
                           <h4 className="font-bold text-gray-200 mb-1">{ep.number}. {ep.title}</h4>
                           <span className="text-xs text-gray-500 flex items-center gap-1">
                             <Clock className="w-3 h-3"/> {formatTime(ep.length)}
                           </span>
                         </div>
                         <p className="text-xs text-gray-400 line-clamp-2">{ep.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div> 
      </DialogContent>
    </Dialog>
  )
}

//data?.videotype === "SERIES" && data.seasons.length > 0