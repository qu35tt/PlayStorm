import { LogOut, Search, Settings } from "lucide-react"
import { useNavigate } from "react-router";
import { useUserStore } from '../stores/userStore'
import axios from "axios";
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { useEffect } from "react";
import { useUser } from "@/context/user-context";
import { useModal } from "@/hooks/use-modal-store";
import { Separator } from "@/components/ui/separator";

interface NavbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export function Navbar({ searchQuery, setSearchQuery } : NavbarProps) {
    const nav = useNavigate();
    const user = useUserStore()

    const { userCredentials, setUser, clearUser }= useUser();
    const { onOpen } = useModal();

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
            clearUser();
                
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

    async function getUserData() {
        try{
            await axios.get(`${import.meta.env.VITE_API_URL}user/me/${user.userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                }
            )
            .then(function (response) {
                setUser({username: response.data.username, avatarUrl: response.data.avatarUrl})
                
            })
            .catch(function (err){
                    console.error(err)
            })
        } 
        catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        if(!userCredentials) { getUserData() }
    }, [user.userId])

    function handleClick() {
        onOpen("profile", "");
    }

    return (
        <div className="w-full h-[10rem] bg-[#0E111A] flex flex-row items-center text-4xl px-4">
            <img
                src="/logo.svg"
                className="w-[20rem] h-[10rem] p-6 object-contain z-10 block"
                alt="Logo"
            />
            <div className="w-3/4 flex flex-row justify-center items-center space-x-[20rem]">
                <div className="font-extrabold cursor-pointer">Home</div>
                <div className="font-extrabold cursor-pointer">Films</div>
                <div className="font-extrabold cursor-pointer">Series</div>
            </div>
            <div className="w-1/4 flex items-center justify-center">
                <input type="search" className="realtive w-[20rem] block rounded-2xl onfocus:border-1 border-neutral-200 bg-transparent p-4 text-base" placeholder="Search" aria-label="Search" onChange={(e) => setSearchQuery(e.target.value)} />
                <Search className="w-6 h-6 mx-4"/>
            </div>
            <div className="w-[20rem] h-full flex justify-center items-center focus:outline-0 px-16">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <img
                            src={userCredentials?.avatarUrl ?? "/default_avatar.webp"}
                            alt="Profile"
                            className="w-24 h-24 object-fill rounded-full border border-gray-300"
                        />
                    </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-3 w-[12rem] bg-[#0E111A] text-white border-0">
                              <DropdownMenuLabel>
                                <div className="flex items-center gap-4 py-4">
                                <img
                                    src={userCredentials?.avatarUrl ?? "/default_avatar.webp"}
                                    alt="Profile"
                                    className="w-16 h-16 object-contain rounded-full border border-gray-300 flex justify-start"
                                />
                                <span className="font-semibold text-lg text-center mx-auto">{userCredentials?.username}</span>
                                </div>
                            </DropdownMenuLabel>
                            <Separator className="my-4 bg-gray-500/20"/>
                            <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4]" onClick={() => handleClick()}>Settings <Settings className="h-4 w-4 ml-auto"/></DropdownMenuItem>
                            <DropdownMenuItem className="text-red-800 cursor-pointer hover:bg-[#06B6D4]" onClick={() => handleLogout()}>Logout <LogOut className="h-4 w-4 ml-auto text-red-800"/></DropdownMenuItem>
                        </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}