import { LogOut, Search, Settings, User } from "lucide-react"
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
import { DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useEffect } from "react";
import { useUser } from "@/context/user-context";

export function Navbar() {
    const nav = useNavigate();
    const user = useUserStore()

    const { userCredentials, setUser, clearUser }= useUser();

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
                setUser({username: response.data.username, avatarUrl: ""})
                
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
            <div className="relative flex flex-wrap items-center justify-center px-4">
                <input type="search" className="realtive w-3/4 m-0 block rounder border border-solid border-neutral-200 bg-transparent px-4 text-base" placeholder="Search" aria-label="Search" />
                <Search className="w-6 h-6 mx-4"/>
            </div>
            <div className="w-[20rem] h-full flex justify-center items-center focus:outline-0 px-2">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <img
                            src="/profile-placeholder.png"
                            alt="Profile"
                            className="w-24 h-24 rounded-full border border-gray-300"
                        />
                    </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-3 w-[12rem] bg-[#1F2A4d] text-white">
                              <DropdownMenuLabel>
                                <div className="flex items-center gap-4 py-4">
                                <img
                                    src="/profile-placeholder.png"
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border border-gray-300 flex justify-start"
                                />
                                <span className="font-semibold text-lg text-center mx-auto">{userCredentials?.username}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>Profile <User className="h-4 w-4 ml-auto"/></DropdownMenuItem>
                            <DropdownMenuItem>Settings <Settings className="h-4 w-4 ml-auto"/></DropdownMenuItem>
                            <DropdownMenuItem className="text-red-800" onClick={() => handleLogout()}>Logout <LogOut className="h-4 w-4 ml-auto text-red-800"/></DropdownMenuItem>
                        </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}