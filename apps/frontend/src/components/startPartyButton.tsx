import { useUser } from "../context/user-context";
import { usePartyStore } from "../stores/partyStore";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

export function StartPartyButton() {
  const { onOpen } = useModal();
  const { userCredentials } = useUser();
  const { userId } = useUserStore();

  const {
    roomId,
    user: storeUser,
    setUser,
    initializeSocket,
    createParty,
  } = usePartyStore();

  function handleClick() {
    if (roomId) {
      console.log("Party již běží. Otevírám modál.");
      onOpen("party", "");
      return;
    }

    if (!userCredentials) {
      console.error("Nelze spustit party: uživatel není přihlášen.");
      return;
    }

    if (!storeUser) {
      setUser({...userCredentials, id: userId});
    }

    initializeSocket();

    createParty();

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