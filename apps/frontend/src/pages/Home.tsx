import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Outlet } from "react-router"
import { ModalProvider } from "../providers/modal-provider"
import { useState, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import axios from "axios"

type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
}

export function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [videos, setVideos] = useState<VideoData[]>([]);
    const user = useUserStore();
    
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
        return video.name.toLowerCase().includes(searchQuery.toLowerCase());
      })

    return(
        <div className="w-screen h-screen flex flex-col text-white">
            <Navbar  searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <Outlet context={{ videos: filteredVideos }} />
            <Footer />
            <ModalProvider />
        </div>
    )
}