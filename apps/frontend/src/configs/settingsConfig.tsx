import { User, Captions, } from "lucide-react"
import { ProfileSettings } from "@/components/settings/ProfileSettings"
import { CaptionsSettings } from "@/components/settings/CaptionsSettings"

export const settingsConfig = {
    profile: {
        name: "Profile",
        icon: User,
        component: ProfileSettings
    },
    captions: {
        name: "Captions",
        icon: Captions,
        component: CaptionsSettings
    },
    // party: {
    //     name: "Party",
    //     icon: PartyPopper,
    //     component: PartySettings
    // }
}