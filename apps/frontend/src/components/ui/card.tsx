type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
}

export function Card(videoData: VideoData){
    return (
        <div className="w-[30rem] h-[20rem] bg-black m-8 snap-center snap-always object-scale-down">
            <img
                src={videoData.thumbnail}
                className="w-full h-full p-6 object-contain z-10 block"
                alt={videoData.name}
            />
        </div>
    )
}