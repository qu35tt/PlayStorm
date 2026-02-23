import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

import { settingsConfig } from "@/configs/settingsConfig";
import { Separator } from "@/components/ui/separator";

export function ProfileModal() {
  const { isOpen, onClose, type } = useModal();

  const [activeTab, setActiveTab] = useState<keyof typeof settingsConfig>("profile");
  const ActiveComponent = settingsConfig[activeTab].component;

  const isModalOpen = isOpen && type === "profile";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="md:w-3/4 w-2/4 h-4/5 bg-[#0E111A] text-white p-0 m-0 overflow-hidden border-0">
        <DialogHeader className="w-full h-full m-0 p-0 flex flex-row">
          <div className="hidden md:block w-1/4 h-full border-r border-gray-700">
            <ul className="w-3/4 h-full flex flex-col mx-auto py-4 space-y-4">
              {Object.entries(settingsConfig).map(([key, { name, icon: Icon }]) => (
                <li
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof settingsConfig)}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-lg cursor-pointer rounded-md transition ${
                    activeTab === key
                      ? "bg-gray-700/40 text-white"
                      : "text-gray-400 hover:bg-gray-600/20"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{name}</span>
                </li>
              ))}
                <div className="w-full h-[5rem] mt-auto">
                    <Separator className="w-3/4"/>
                    <div className="text-center p-4">AppVersion: 1.0</div>
                </div>
            </ul>
          </div>
          <div className="flex-1 h-full p-6 overflow-y-auto">
            <ActiveComponent />
          </div>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
