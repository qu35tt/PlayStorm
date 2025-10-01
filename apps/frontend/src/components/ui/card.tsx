import { useModal } from "@/hooks/use-modal-store"

type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
}

export function Card(videoData: VideoData){

    const { onOpen } = useModal()

    function handleClick(){
        // nav(`/watch/${videoData.id}`)
        onOpen("video", videoData.id)
    }

    return (
        <div className="w-[30rem] h-[20rem] bg-black m-8 snap-center snap-always object-scale- cursor-pointer hover:scale-108" onClick={handleClick}>
            <img
                src={videoData.thumbnail}
                className="w-full h-full p-6 object-contain z-10 block"
                alt={videoData.name}
            />
        </div>
    )
}