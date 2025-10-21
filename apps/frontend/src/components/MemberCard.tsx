import { useUser } from "@/context/user-context";
import { User } from "lucide-react";


export function MemberCard() {

    const userName = useUser().userCredentials?.username

    return(
        <div className="w-full h-[5rem] bg-gray-400/35 rounded-md drop-shadow-xl flex items-center">
            <User className="w-12 h-12"/>
            <h2 className="mx-auto font-semibold text-2xl">{userName}</h2>
        </div>
    )
}