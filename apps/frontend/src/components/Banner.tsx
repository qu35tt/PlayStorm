import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import axios from "axios"
import { useUserStore } from "@/stores/userStore";
import { useModal } from "@/hooks/use-modal-store";

type VideoData = {
    id: string
    name: string
    banner: string
}

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

    const bgUrl = bannerVideo?.banner ?? "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp5522079.jpg&f=1&nofb=1";

    return(
        <div className="z-10 w-full h-2/4 m-0 p-0 bg-cover bg-bottom" style={{ backgroundImage: `url(${bgUrl})` }}>
            <div className="w-full h-full">
                <div className="w-full h-full bg-black/62 z-40 text-white">
                    <h2 className="text-7xl font-extrabold pt-8 p-[5rem]">{bannerVideo?.name}</h2>
                    <p className="w-[50rem] pl-[4rem] text-md font-light">Stranger Things is an American television series created by the Duffer Brothers for Netflix. Produced by Monkey Massacre Productions and 21 Laps Entertainment, the first season was released on Netflix on July 15, 2016. The second and third seasons followed in October 2017 and July 2019, respectively, and the fourth season was released in two parts in May and July 2022. The fifth and final season is expected to be released in three parts in November and December 2025. The show is a mix of the horror, drama, science-fiction, mystery, and coming-of-age genres.</p>
                    <Button className="w-[10rem] bg-white hover:bg-gray-300 text-black m-[4rem] cursor-pointer z-50" onClick={() => onOpen("video", bannerVideo!.id)}><Play className="w-4 h-4 "/>Play Video</Button>
                </div>
            </div>
        </div>
    )
}