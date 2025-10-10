import { useModal } from "@/hooks/use-modal-store"

type VideoData = {
    id: string
    name: string
    length: number
    thumbnail: string
}

interface CardProps {
    videoData: VideoData
}

export function Card({ videoData }: CardProps){

    const { onOpen } = useModal()

    function handleClick(){
        onOpen("video", videoData.id)
    }

    return (
        <div
            className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:w-[30rem] m-4 rounded-lg overflow-hidden bg-black cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={handleClick}
            role="button"
            aria-label={`Open ${videoData.name}`}
        >
            <div className="w-full aspect-[16/9] bg-gray-800">
                <img
                    src={videoData.thumbnail}
                    className="w-full h-full object-cover block"
                    alt={videoData.name}
                />
            </div>
            {/* optional footer with title */}
            <div className="p-3 text-sm md:text-base text-white">
                <div className="font-semibold truncate">{videoData.name}</div>
            </div>
        </div>
    )
}