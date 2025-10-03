import { Separator } from "@/components/ui/separator"
import { Button } from "../ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ProfileSettings(){
    
    
    return(
        <>
            <div className="h-1/4 flex flex-row items-center px-8">
                <img
                    src="./public/default_avatar.webp"
                    alt="Profile"
                    className="w-[13rem] h-[13rem] rounded-full border border-gray-300 mx-8"
                />
                <Button className="bg-[#3B82F6] text-md w-[8rem] h-[3rem] mx-auto cursor-pointer hover:bg-[#06B6D4] border-0">Upload avatar</Button>
                <Button className="bg-gray-600 text-md w-[8rem] h-[3rem] mx-auto cursor-pointer hover:bg-[#06B6D4] border-0">Delete avatar</Button>
            </div>
            <Separator className="bg-gray-400/70"/>
            <div className="max-h-3/4 px-8 grid grid-cols-2 gap-x-4 py-4 space-y-8">
                <div className="space-y-2">
                    <Label className="text-md">Username</Label>
                    <Input className="bg-[#0E111A] h-[3rem]" type="text" placeholder="Enter Username..."/>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-md">Email</Label>
                    <Input className="bg-[#0E111A] h-[3rem]" type="email" placeholder="Enter Email..."/>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-md">Password</Label>
                    <Input className="bg-[#0E111A] h-[3rem]" type="password" placeholder="Enter Password..."/>
                </div>
            </div>
        </>
    )
}