import { User, VideoIcon, PartyPopper } from "lucide-react"
import { ProfileSettings } from "@/components/settings/ProfileSettings"

export const settingsConfig = {
    profile: {
        name: "Profile",
        icon: User,
        component: ProfileSettings
    },
    // video: {
    //     name: "Video",
    //     icon: VideoIcon,
    //     component: VideoSettings
    // },
    // party: {
    //     name: "Party",
    //     icon: PartyPopper,
    //     component: PartySettings
    // }
}