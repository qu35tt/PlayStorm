import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Outlet } from "react-router"
import { ModalProvider } from "../providers/modal-provider"
import { useState } from "react"
import type { VideoType} from "@/types/video-data-types"
import { useVideos } from "@/lib/query-client";

export function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [type, setType] = useState<VideoType>("ALL");
    
    const { data: videos = [], isLoading } = useVideos();

    if (isLoading) {
        return <div className="w-screen h-screen flex justify-center items-center text-white">Loading...</div>
    }

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