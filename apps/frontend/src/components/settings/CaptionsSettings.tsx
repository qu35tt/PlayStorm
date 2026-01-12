import { useCaptionStore } from "@/stores/captionsStore"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "../ui/label"
import { Slider } from "@/components/ui/slider"
import { ChevronDown } from "lucide-react"
import { EDITOR_OPTIONS } from "@/configs/editorOptions"
import { useEffect } from "react"
 
export function CaptionsSettings() {
    const { styles, updateStyle, resetStyles, currentCaptionText } = useCaptionStore()
    const options = EDITOR_OPTIONS

    useEffect(() => {

    }, [styles])

    return(
        <div className="w-full h-full flex flex-col justify-center items-center space-y-4">
            <div className="relative w-3/4 h-1/4 border-2 border-white bg-gray-600 flex items-center justify-center">
                <h2 className="w-3/4 text-center"
                style ={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    color: styles.textColor,
                    backgroundColor: styles.backgroundColor,
                    opacity: styles.backgroundOpacity / 100,
                    bottom: styles.verticalPosition + '%'
                }}
                >
                    {currentCaptionText}
                </h2>
            </div>
        <div className="space-x-4 space-y-4 flex flex-wrap flex-row justify-center items-center">
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
                <div className="flex flex-row space-x-8">
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <Label>Opacity:</Label>
                            <Slider
                                value={[styles.backgroundOpacity]}
                                max={100}
                                step={10}
                                className="w-75"
                                onValueChange={(value) => updateStyle('backgroundOpacity', value[0])}
                            />
                    </div>
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <Label>Vertical Position:</Label>
                            <Slider
                                value={[styles.verticalPosition]}
                                max={16}
                                min={8}
                                step={2}
                                className="w-75"
                                onValueChange={(value) => updateStyle('verticalPosition', value[0])}
                            />
                    </div>
                </div>
                <Button className="w-40 h-10 my-8 bg-red-400" onClick={() => resetStyles()}>Reset to default</Button>
            </div>
        </div>
    )
}