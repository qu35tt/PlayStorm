import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Outlet } from "react-router"
import { ModalProvider } from "../providers/modal-provider"
import { useState, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import axios from "axios"
import type { VideoType} from "@/types/video-data-types"

type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
    videotype: 'MOVIE' | 'SERIES',
    genre_id: number
    createAt: Date
}

export function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [videos, setVideos] = useState<VideoData[]>([]);
    const user = useUserStore();
    const [type, setType] = useState<VideoType>("ALL");
    
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

      const filteredVideos = videos.filter((video) => {
        const matchesType = (type === "ALL") || (video.videotype === type);
        const matchesQuery = video.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesQuery;
      })

    return(
        <div className="w-screen h-screen flex flex-col text-white">
            <Navbar setSearchQuery={setSearchQuery} setType={setType} selectedType={type} />
            <Outlet context={{ videos: filteredVideos, searchQuery: searchQuery }} />
            <Footer />
            <ModalProvider />
        </div>
    )
}