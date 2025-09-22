import { Forward, Play, Rewind } from "lucide-react";

export function VideoPlayer(){
    return(
        <div className="realtive w-screen h-screen group bg-black">
            <video>
                <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4"/>
                <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm"/>
            </video>

            {/* CONTROLS */}
            <div
                id="controls"
                className="opacity-0 p-5 absolute bottom-0 left-0 w-full 
                        transition-opacity duration-300 ease-linear 
                        group-hover:opacity-100"
            >
                {/* PROGRESS BAR */}
                <div id="progress-bar" className="h-1 w-full bg-white cursor-pointer mb-4">
                <div
                    id="progress-indicator"
                    className="h-full w-9 bg-indigo-800 transition-all duration-500 ease-in-out"
                />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {/* REWIND */}
                        <button
                        id="rewind"
                        className="transition-all duration-100 ease-linear hover:scale-125"
                        >
                        <i className="material-icons text-white text-3xl w-12"><Rewind /></i>
                        </button>

                        {/* PLAY / PAUSE */}
                        <button
                        id="play-pause"
                        className="transition-all duration-100 ease-linear hover:scale-125"
                        >
                        <i className="material-icons text-white text-5xl w-12">
                            <Play />
                        </i>
                        </button>

                        {/* FAST FORWARD */}
                        <button
                        id="fast-forward"
                        className="transition-all duration-100 ease-linear hover:scale-125"
                        >
                        <i className="material-icons text-white text-3xl w-12"><Forward /></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}