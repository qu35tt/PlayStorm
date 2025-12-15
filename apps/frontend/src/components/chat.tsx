import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react"

export function Chat() {
    return (
        <div className="w-full h-full flex flex-col justify-end items-center py-6">
            <div className="w-full h-6 flex flex-row justify-center items-center space-x-4">
                <Input className="w-full h-16 p-2"/>
                <Button className="w-16 h-16 hover:bg-cyan-600"><Send /></Button>
            </div>
        </div>
    )
}