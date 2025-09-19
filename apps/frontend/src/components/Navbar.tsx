import { LogOut, Settings, User } from "lucide-react"
import { useNavigate } from "react-router";
import { useUserStore } from '../stores/userStore'
import axios from "axios";
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
    const nav = useNavigate();
    const user = useUserStore()

    async function handleLogout(){
        try{
        await axios.post(
            `${import.meta.env.VITE_API_URL}auth/logout`,
            { userId: user.userId },
            {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }
        )
        .then(function () {
            user.clearId();
            user.clearToken();

            nav("/");
            toast.success("Logged out succesfully!", {duration: 2000})
        })
        .catch(function (err){
                console.error(err)
        })
        } 
        catch(err){
            console.log(err)
        }
    }

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
            <div className="w-[20rem] h-full flex justify-center items-center focus:outline-0 ">
                <DropdownMenu>
                    <DropdownMenuTrigger><User className="w-[4rem] h-[4rem] cursor-pointer" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Profile <User className="h-4 w-4 ml-auto"/></DropdownMenuItem>
                            <DropdownMenuItem>Settings <Settings className="h-4 w-4 ml-auto"/></DropdownMenuItem>
                            <DropdownMenuItem className="text-red-800" onClick={() => handleLogout()}>Logout <LogOut className="h-4 w-4 ml-auto text-red-800"/></DropdownMenuItem>
                        </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}