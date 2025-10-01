import { useModal } from "@/hooks/use-modal-store";
import { useNavigate } from "react-router"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";

type videoData = {
  name: string,
  banner: string,
  genre: {
    id: string,
    name: string
  },
}

export function VideoModal(){
  const nav = useNavigate();
  const user = useUserStore();
  const { isOpen, onClose, type, videoId } = useModal();
  const [data, setData] = useState<videoData | null>();

  const isModalOpen = isOpen && type === "video";

  useEffect(() => {
    setData(null);
    async function getData(){
      const response = await axios.get(`${import.meta.env.VITE_API_URL}video/data/${videoId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      setData(response.data);
    }

    if (videoId) {
      getData();
    }
  }, [videoId, user.token])

  function handleClick(){
    nav(`/watch/${videoId}`);
    onClose();
  }

  return(
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-3/4 bg-[#0F2340] text-white p-0 m-0 overflow-hidden border-0">
          <DialogHeader className="w-full h-[30rem] m-0 p-0 bg-cover bg-bottom" style={{ backgroundImage: `url(${data?.banner ?? ""})` }}>
            <div className="w-full h-[30rem] bg-black/65 flex items-end">
              <Button className="w-[10rem] bg-white hover:bg-gray-300 text-black m-[4rem] cursor-pointer" onClick={handleClick}><Play className="w-4 h-4 "/> Play</Button>
            </div>
          </DialogHeader>
          <DialogDescription className="text-lg text-white p-8">
            <h2 className="text-4xl font-extrabold py-10">{data?.name}</h2>
            <p className="w-[50rem] text-md font-light">Stranger Things is an American television series created by the Duffer Brothers for Netflix. Produced by Monkey Massacre Productions and 21 Laps Entertainment, the first season was released on Netflix on July 15, 2016. The second and third seasons followed in October 2017 and July 2019, respectively, and the fourth season was released in two parts in May and July 2022. The fifth and final season is expected to be released in three parts in November and December 2025. The show is a mix of the horror, drama, science-fiction, mystery, and coming-of-age genres.</p>
            <Separator className="my-8"/>
            <h2 className="text-4xl font-extrabold py-10">Info about Stranger Things</h2>
              <p>Genres: {data?.genre.name}</p>
              <p>Release Date: 2025</p>
          </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}