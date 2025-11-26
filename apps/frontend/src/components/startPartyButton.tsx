import { useModal } from "../hooks/use-modal-store";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function StartPartyButton() {
  const { onOpen } = useModal();

  function handleClick() {
    onOpen("party", "");
  }

  return (
    <Button
      className="absolute bg-[#3B82F6] hover:bg-[#06B6D4] right-8 bottom-18 w-[4rem] h-[4rem] rounded-md cursor-pointer z-50"
      onClick={handleClick}
    >
      <Plus />
    </Button>
  );
}