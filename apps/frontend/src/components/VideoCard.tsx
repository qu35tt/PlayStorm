import { useModal } from "@/hooks/use-modal-store"
import type { CardProps } from '@/types/video.types'



export function VideoCard({ videoData }: CardProps){

    const { onOpen } = useModal()

    function handleClick(){
        onOpen("video", videoData.id)
    }

    return (
        <div
            className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:w-[30rem] m-4 rounded-lg overflow-hidden bg-black cursor-pointer transform hover:scale-105 transition-all duration-200 group"
            onClick={handleClick}
            role="button"
            aria-label={`Open ${videoData.name}`}
        >
            <div className="relative w-full aspect-[16/9] bg-gray-900">
                <img
                    src={videoData.thumbnail}
                    className="w-full h-full object-cover block"
                    alt={videoData.name}
                />
                <div className="absolute inset-0 flex items-end p-4 pointer-events-none">
                    <div className="w-full pointer-events-auto">
                        <div className="bg-gradient-to-t from-black/80 to-transparent p-3 rounded-md opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <div className="text-white">
                                <div className="font-semibold text-lg truncate">{videoData.name}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}