import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import axios from "axios"
import { useUserStore } from "@/stores/userStore";
import { useModal } from "@/hooks/use-modal-store";
import type { VideoData } from "@/types/video.types";

export function Banner() {
    const [bannerVideo, setBannerVideo] = useState<VideoData>()
    const user = useUserStore();
    const didFetchRef = useRef(false);

    const { onOpen } = useModal()

    function getBannerVideo(){
        try{
            axios.get(`${import.meta.env.VITE_API_URL}video/random`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(function (response){
                setBannerVideo(response.data);
            })
            .catch(function (err){
                console.log(err)
            })
        }
        catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        getBannerVideo();
    }, []);

    const bgUrl = bannerVideo?.thumbnail ?? "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp5522079.jpg&f=1&nofb=1";

    return(
        <div
            className="relative z-10 w-full bg-cover bg-bottom"
            style={{ backgroundImage: `url(${bgUrl})` }}
        >
            <div className="min-h-[6rem] md:min-h-[2rem] lg:min-h-[4rem] xl:min-h-[6rem] w-full">
                <div className="absolute inset-0 bg-black/62 z-40 text-white" />

                <div className="relative z-50 h-full flex items-start">
                    <div className="container px-4 sm:px-6 md:px-12 lg:px-20 py-8 lg:py-16">
                        <div className="max-w-screen">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">{bannerVideo?.name}</h2>
                            <p className="mt-4 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">Stranger Things is an American television series created by the Duffer Brothers for Netflix. Produced by Monkey Massacre Productions and 21 Laps Entertainment, the first season was released on Netflix on July 15, 2016. The second and third seasons followed in October 2017 and July 2019, respectively, and the fourth season was released in two parts in May and July 2022. The fifth and final season is expected to be released in three parts in November and December 2025. The show is a mix of the horror, drama, science-fiction, mystery, and coming-of-age genres.</p>
                            <div className="mt-6">
                                
                                <Button
                                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-300 px-5 py-3 rounded-md"
                                    onClick={() => bannerVideo && onOpen("video", bannerVideo.id)}
                                >
                                    <Play className="w-4 h-4" />
                                    Play Video
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}