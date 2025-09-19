import { User } from "lucide-react"

export function Navbar() {
    return (
        <div className="w-full h-[10rem] bg-black/20 flex flex-row items-center text-4xl px-8">
            <img
                src="/logo.svg"
                className="w-[20rem] h-[10rem] p-6 object-contain z-10 block"
                alt="Logo"
            />
            <div className="flex-1 flex flex-row justify-center items-center gap-x-[20rem]">
                <div className="font-extrabold cursor-pointer">Home</div>
                <div className="font-extrabold cursor-pointer">Films</div>
                <div className="font-extrabold cursor-pointer">Series</div>
            </div>
            <div className="w-[20rem] h-full flex justify-center items-center">
                <User className="w-[4rem] h-[4rem] cursor-pointer" />
            </div>
        </div>
    )
}