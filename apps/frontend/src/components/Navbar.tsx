import { LogOut, Search, Settings } from "lucide-react"
import { useNavigate } from "react-router";
import { useUserStore } from '../stores/userStore'
import axios from "axios";
import { toast } from "sonner"
import { useSocket } from "@/context/socket-context";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { useModal } from "@/hooks/use-modal-store";
import { Separator } from "@/components/ui/separator";
import type { VideoType, NavbarProps } from '@/types/video-data-types'
import { queryClient } from "@/lib/query-client";


export function Navbar({ setSearchQuery, setType, selectedType } : NavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const nav = useNavigate();
    const user = useUserStore()

    const { userCredentials, setUser, clearUser }= useUser();
    const { onOpen } = useModal();
    const socket = useSocket();

    const base = "font-extrabold cursor-pointer hover:scale-112 hover:bg-gray-500/20 p-4 rounded-lg ease-in-out transition duration-250";
    const activeClass = "underline decoration-4 underline-offset-8 decoration-white"
    const itemClass = (t: VideoType) => `${base} ${selectedType === t ? activeClass : ""}`;

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
            queryClient.clear();
                
            nav("/");
            toast.success("Logged out succesfully!", {duration: 2000})
            socket.disconnect();
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

    function handleFilter(index: number){
        switch(index){
            case 0:
                setType("ALL");
                break;
            case 1:
                setType("MOVIE");
                break;
            case 2:
                setType("SERIES");
                break;
            default:
                break;
        }
    }

    return (
        <div className="w-full bg-[#0E111A] text-2xl lg:text-4xl px-4">
            <div className="h-[10rem] flex items-center w-full max-w-screen mx-auto">
                <img
                    src="/logo.svg"
                    className="w-40 md:w-56 lg:w-64 h-auto p-4 object-contain z-10 block"
                    alt="Logo"
                />

                {/* Center links - hidden on small screens */}
                <div className="hidden md:flex flex-1 justify-center items-center gap-12 lg:gap-48">
                    <div className={itemClass("ALL")} onClick={() => handleFilter(0)}>Home</div>
                    <div className={itemClass("MOVIE")} onClick={() => handleFilter(1)}>Films</div>
                    <div className={itemClass("SERIES")} onClick={() => handleFilter(2)}>Series</div>
                </div>

                {/* Search - hidden on small screens */}
                <div className="hidden md:flex items-center justify-center">
                    <input type="search" className="w-[5rem] md:w-[10rem] lg:w-[15rem] rounded-2xl onfocus:border-1 border-neutral-200 bg-transparent p-4 text-base" placeholder="Search" aria-label="Search" onChange={(e) => setSearchQuery(e.target.value)} />
                    <Search className="w-6 h-6 mx-4"/>
                </div>

                {/* Right area: profile + mobile hamburger */}
                <div className="flex items-center gap-4 ml-auto">
                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden p-3 rounded-lg hover:bg-gray-500/10"
                        aria-label="Toggle menu"
                        onClick={() => setMobileOpen((s) => !s)}
                    >
                        {/* simple 3-line hamburger */}
                        <div className="w-6 h-0.5 bg-white my-1"></div>
                        <div className="w-6 h-0.5 bg-white my-1"></div>
                        <div className="w-6 h-0.5 bg-white my-1"></div>
                    </button>

                    <div className="hidden md:flex w-56 h-full justify-center items-center focus:outline-0 px-8">
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
            </div>

            {/* Mobile menu - slides down on small screens */}
            {mobileOpen && (
                <div className="md:hidden w-full bg-[#0E111A] px-6 py-4 border-t border-gray-800">
                    <div className="flex flex-col items-center space-y-4 text-xl">
                        <button className={itemClass("ALL")} onClick={() => { handleFilter(0); setMobileOpen(false); }}>Home</button>
                        <button className={itemClass("MOVIE")} onClick={() => { handleFilter(1); setMobileOpen(false); }}>Films</button>
                        <button className={itemClass("SERIES")} onClick={() => { handleFilter(2); setMobileOpen(false); }}>Series</button>

                        <div className="w-full flex items-center">
                            <input type="search" className="w-full rounded-2xl border border-neutral-700 bg-transparent p-3 text-base" placeholder="Search" aria-label="Search" onChange={(e) => setSearchQuery(e.target.value)} />
                            <Search className="w-6 h-6 mx-4"/>
                        </div>

                        <div className="w-full flex items-center md:justify-center justify-between pt-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={userCredentials?.avatarUrl ?? "/default_avatar.webp"}
                                            alt="Profile"
                                            className="w-12 h-12 object-fill rounded-full border border-gray-300"
                                        />
                                        <span className="font-semibold">{userCredentials?.username}</span>
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="p-3 w-full bg-[#0E111A] text-white border-0">
                                    <DropdownMenuLabel>
                                        <div className="flex items-center gap-4 py-2">
                                            <img
                                                src={userCredentials?.avatarUrl ?? "/default_avatar.webp"}
                                                alt="Profile"
                                                className="w-12 h-12 object-contain rounded-full border border-gray-300"
                                            />
                                            <span className="font-semibold text-lg">{userCredentials?.username}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <Separator className="my-2 bg-gray-500/20"/>
                                    <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4]" onClick={() => { handleClick(); setMobileOpen(false); }}>Settings <Settings className="h-4 w-4 ml-auto"/></DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-800 cursor-pointer hover:bg-[#06B6D4]" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout <LogOut className="h-4 w-4 ml-auto text-red-800"/></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}