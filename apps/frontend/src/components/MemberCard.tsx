import { DoorOpen, User } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import type { MemberCardProps } from '@/types/video.types';

export function MemberCard({ user }: MemberCardProps) {
  const { username, avatarUrl } = user;

  function handleKick() {
    
  }

  return (
    <div className="w-full h-[5rem] bg-gray-400/35 rounded-md drop-shadow-xl flex items-center p-2 space-x-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-500/50 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
      )}
      
      <h2 className="font-semibold text-2xl truncate" title={username}>
        {username}
      </h2>

      <div className="ml-auto p-4 flex justify-center items-center focus:outline-0">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="cursor-pointer">
              <Ellipsis  className="w-8 h-8"/>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-4 w-[8rem] bg-[#0E111A] text-white border-0 absolute right-0 rounded-lg">
            <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4] flex items-center text-red-800 rounded-md p-2" onClick={handleKick}>Kick <DoorOpen className="w-4 h-4 ml-auto text-red-800"/></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
