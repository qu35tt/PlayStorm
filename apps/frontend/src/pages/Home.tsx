import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { VideoLists } from "../components/VideoLists"

export function Home() {
    return(
        <div className="w-screen h-screen flex flex-col">
            <Navbar />
            <VideoLists />
            <Footer />
        </div>
    )
}