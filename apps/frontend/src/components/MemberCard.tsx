import { User } from "lucide-react";
import type { PartyUser } from "@/types/socket-types";

type MemberCardProps = {
  user: PartyUser;
  isSelf?: boolean;
};

export function MemberCard({ user }: MemberCardProps) {
  const { username, avatarUrl } = user;

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
    </div>
  );
}
