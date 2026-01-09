import { useCaptionStore } from "@/stores/captionsStore"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "../ui/label"
import { ChevronDown } from "lucide-react"
import { EDITOR_OPTIONS } from "@/configs/editorOptions"
 
export function CaptionsSettings() {
    const { styles, updateStyle, currentCaptionText } = useCaptionStore()
    const options = EDITOR_OPTIONS

    return(
        <div className="w-full h-full flex flex-col justify-center items-center space-y-4">
            <div className="w-3/4 h-1/4 border-2 border-white bg-gray-600 flex items-center justify-center">
                <h2 className="text-center">{currentCaptionText}</h2>
            </div>
        <div className="space-x-4 flex flex-wrap flex-row">
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Label>Font Size:</Label>
                            <Button className="w-fit bg-[#3B82F6] hover:bg-[#06B6D4]">{styles.fontSize}<ChevronDown className="w-4 h-4 ml-auto"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#0E111A] text-white" align="start">
                            {options.fontSize.map((item) => (
                                <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4]" onClick={() => updateStyle('fontSize', item.value)}>{item.label}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Label>Text Color:</Label>
                            <Button className="w-fit bg-[#3B82F6] hover:bg-[#06B6D4]">{styles.textColor}<ChevronDown className="w-4 h-4 ml-auto"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#0E111A] text-white" align="start">
                            {options.colors.map((item) => (
                                <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4]" onClick={() => updateStyle('textColor', item.hex )}>{item.label}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Label>Background:</Label>
                            <Button className="w-fit bg-[#3B82F6] hover:bg-[#06B6D4]">{styles.backgroundColor}<ChevronDown className="w-4 h-4 ml-auto"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#0E111A] text-white" align="start">
                            {options.backgroundColor.map((item) => (
                                <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4]" onClick={() => updateStyle('backgroundColor', item.hex)}>{item.label}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Label>Font Weight:</Label>
                            <Button className="w-fit bg-[#3B82F6] hover:bg-[#06B6D4]">{styles.fontWeight}<ChevronDown className="w-4 h-4 ml-auto"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#0E111A] text-white" align="start">
                            {options.fontWeight.map((item) => (
                                <DropdownMenuItem className="cursor-pointer hover:bg-[#06B6D4]" onClick={() => updateStyle('fontWeight', item.value)}>{item.label}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}