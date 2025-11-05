import { User } from "lucide-react";
// Import the RoomUser type you created. Adjust path if necessary.
import type { RoomUser } from "@/types/socket-types";

// 1. Define the props. The component will receive a 'user' object.
type MemberCardProps = {
  user: RoomUser;
};

// 2. Accept the 'user' prop
export function MemberCard({ user }: MemberCardProps) {
  // 3. Get the username and avatar from the prop, not the hook
  const { username, avatarUrl } = user;

  return (
    <div className="w-full h-[5rem] bg-gray-400/35 rounded-md drop-shadow-xl flex items-center p-2 space-x-4">
      {/* 4. Use the avatarUrl for an image, with a fallback to the icon */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="w-12 h-12 rounded-full object-cover"
          // Add a fallback in case the image link is broken
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      ) : (
        // Fallback icon if no avatarUrl
        <div className="w-12 h-12 rounded-full bg-gray-500/50 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
      )}
      
      {/* 5. Display the username from the prop */}
      <h2 className="font-semibold text-2xl truncate" title={username}>
        {username}
      </h2>
    </div>
  );
}
