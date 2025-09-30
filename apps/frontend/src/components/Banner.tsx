import { Button } from "./ui/button";
import { Play } from "lucide-react";

export function Banner() {
    return(
        <div className="z-10 w-full h-3/4 m-0 p-0 bg-cover bg-bottom bg-[url(https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp5522079.jpg&f=1&nofb=1&ipt=9aee829ffff8b447fdbc0690a5536759c50ff4366a243aa8714e0098df42b3aa)]">
            <div className="w-full h-full">
                <div className="w-full h-full bg-black/62 z-40 text-white">
                    <h2 className="text-7xl font-extrabold p-[5rem]">Stranger Things</h2>
                    <p className="w-[50rem] pl-[4rem] text-md font-light">Stranger Things is an American television series created by the Duffer Brothers for Netflix. Produced by Monkey Massacre Productions and 21 Laps Entertainment, the first season was released on Netflix on July 15, 2016. The second and third seasons followed in October 2017 and July 2019, respectively, and the fourth season was released in two parts in May and July 2022. The fifth and final season is expected to be released in three parts in November and December 2025. The show is a mix of the horror, drama, science-fiction, mystery, and coming-of-age genres.</p>
                    <Button className="w-[10rem] bg-white hover:bg-gray-300 text-black m-[4rem] cursor-pointer z-50"><Play className="w-4 h-4 "/> Play video</Button>
                </div>
            </div>
        </div>
    )
}