import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Banner } from "./Banner"
import { VideoModal } from "./modals/video-modal"
import { useOutletContext } from "react-router"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useRef } from "react"

type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
}

interface OutletContext {
    videos: VideoData[];
}

export function VideoLists() {
  const { videos } = useOutletContext<OutletContext>();
  
  const rowViewportsRef = useRef<(HTMLDivElement | null)[]>([]);

  

  if(videos.length === 0){
    return(
      <div className="w-full flex-1 min-h-0 p-0 space-y-4 md:space-y-6 overflow-y-auto">
        <VideoModal />
        <div className="p-4 text-center text-gray-400">
            No videos found
        </div>
      </div>
    )
  }

  const chunkArray = (array: VideoData[], size: number) => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
      array.slice(index * size, index * size + size)
    );
  }

  const videoRows = chunkArray(videos, 8);

  function handleScroll(rowIndex: number, direction: number){
    const el = rowViewportsRef.current[rowIndex];
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9) * direction; // 1 => right, -1 => left
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <div className="w-full flex-1 min-h-0 p-0 space-y-4 md:space-y-6 overflow-y-auto">
      <VideoModal />
      <Banner />
      {videoRows.map((rowVideos, rowIdx) => (
        <div key={rowIdx} className="space-y-1 md:space-y-2 p-2 md:p-4">
          <h2 className="text-base md:text-lg font-semibold text-white">
            {getRowTitle(rowIdx, rowVideos.length)}
          </h2>

          {/* container: buttons are siblings so they don't overlap cards */}
          <div className="relative">
            {/* Left button */}
            <button
              type="button"
              aria-label="Scroll left"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-3/4 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => handleScroll(rowIdx, -1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* ScrollArea sits between buttons; add horizontal padding so cards don't go under buttons */}
            <ScrollArea
              className="w-full whitespace-nowrap rounded-md"
              viewportRef={(el) => { rowViewportsRef.current[rowIdx] = el; }}
            >
              <div className="flex gap-2 md:gap-3 px-14"> {/* px-14 keeps content clear of buttons */}
                {rowVideos.map((video, vidIdx) => (
                  <div key={video.id || vidIdx} className="min-w-[12rem] sm:min-w-[18rem] md:min-w-[24rem] lg:min-w-[30rem]">
                    <Card {...video} />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Right button */}
            <button
              type="button"
              aria-label="Scroll right"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-3/4 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => handleScroll(rowIdx, 1)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to generate meaningful row titles
function getRowTitle(rowIndex: number, itemCount: number): string {
  const titles = [
    "Recently Added",
    "Trending Now", 
    "Popular Movies",
    "Recommended for You",
    "Action & Adventure",
    "Comedy Collection",
    "Drama Series",
    "Sci-Fi & Fantasy"
  ];
  
  // Use predefined titles or fall back to generic ones
  return titles[rowIndex] || `More Videos (${itemCount} items)`;
}