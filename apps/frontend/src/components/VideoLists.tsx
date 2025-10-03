import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import axios from "axios"
import { useEffect, useState } from "react"
import { useUserStore } from "@/stores/userStore"
import { Banner } from "./Banner"
import { VideoModal } from "./modals/video-modal"

type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
}


export function VideoLists() {
  const rows = Array.from({ length: 5 })
  const [videos, setVideos] = useState<VideoData[]>([]);
  const user = useUserStore()

  useEffect(() => {
    async function getVideos(){
      try{
        const response = await axios.get(`${import.meta.env.VITE_API_URL}video`, { headers: { Authorization: `Bearer ${user.token}` } });
        setVideos(response.data);
      }
      catch(err){
        console.error(err)
      }
    }
    getVideos()
  }, [user.userId])



  return (
    <div className="w-full flex-1 min-h-0 p-0 space-y-4 md:space-y-6 overflow-y-auto">
      <VideoModal />
      <Banner />
      {rows.map((_, rowIdx) => (
        <div key={rowIdx} className="space-y-1 md:space-y-2 p-2 md:p-4">
          {/* Row Title */}
          <h2 className="text-base md:text-lg font-semibold text-white">
            Row {rowIdx + 1}
          </h2>

          {/* Horizontal Scroll */}
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex gap-2 md:gap-3">
              {videos.map((video, vidIdx) => (
                <div key={video.id ||vidIdx} className="min-w-[12rem] sm:min-w-[18rem] md:min-w-[24rem] lg:min-w-[30rem]">
                  <Card {...video} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}