import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { Button } from "../ui/button";
import { Play } from "lucide-react";

export function VideoModal(){
  const [isMounted, setIsMounted] = useState(true);

  if(!isMounted) return null;

  return(
    <Dialog open={isMounted} onOpenChange={setIsMounted}>
      <DialogContent className="max-w-full w-3/4 bg-[#0F2340] text-white p-0 m-0 overflow-hidden border-0">
          <DialogHeader className="w-full h-[30rem] m-0 p-0 bg-cover bg-bottom bg-[url(https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp5522079.jpg&f=1&nofb=1&ipt=9aee829ffff8b447fdbc0690a5536759c50ff4366a243aa8714e0098df42b3aa)]">
            <div className="w-full h-[30rem] bg-black/65 flex items-end">
              <Button className="w-[10rem] bg-white hover:bg-gray-300 text-black m-[4rem] cursor-pointer"><Play className="w-4 h-4 "/> Play</Button>
            </div>
          </DialogHeader>
          <DialogDescription className="text-lg text-white p-8">
            <h2 className="text-4xl font-extrabold py-10">Stranger Things</h2>
            <p className="w-[50rem] text-md font-light">Stranger Things is an American television series created by the Duffer Brothers for Netflix. Produced by Monkey Massacre Productions and 21 Laps Entertainment, the first season was released on Netflix on July 15, 2016. The second and third seasons followed in October 2017 and July 2019, respectively, and the fourth season was released in two parts in May and July 2022. The fifth and final season is expected to be released in three parts in November and December 2025. The show is a mix of the horror, drama, science-fiction, mystery, and coming-of-age genres.</p>
            <Separator className="my-8"/>
            <h2 className="text-4xl font-extrabold py-10">Info about Stranger Things</h2>
              <p>Genres:</p>
              <p>Release Date:</p>
          </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}