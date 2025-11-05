import { useSocket } from "../context/socket-context";
import { useUser } from "../context/user-context";
import { usePartyStore } from "../stores/partyStore";
import { useModal } from "../hooks/use-modal-store"; // Již máte
import { Button } from "./ui/button"; // Předpokládám
import { Plus } from "lucide-react"; // Již máte

// 1. Předpokládám, že vaše komponenta přijímá 'videoId'
export function StartPartyButton({ videoId }: { videoId: string }) {

  // 2. Získejte všechny potřebné hooky
  const { onOpen } = useModal();
  const socket = useSocket();
  const { userCredentials } = useUser();
  const { roomId, clearParty } = usePartyStore();

  // 3. Toto je vaše plně funkční handleClick funkce
  function handleClick() {
    
    // Case 1: Party již existuje. Jen otevřeme modál.
    if (socket.connected && roomId) {
      console.log("Party již běží. Otevírám modál.");
      onOpen("party", ""); // Používám váš kód
      return;
    }

    // Case 2: Není party. Musíme ji vytvořit.
    if (!userCredentials) {
      console.error("Nelze spustit party: uživatel není přihlášen.");
      return;
    }

    // --- Logika pro vytvoření nové party ---

    const newRoomId = "kys"; // Váš hardcoded room ID

    // Vyčistíme starý stav (pokud nějaký byl)
    clearParty();

    // Nastavíme nové roomId v globálním úložišti *před* připojením
    // To dá SocketManageru vědět, v jaké místnosti jsme.
    usePartyStore.setState({ roomId: newRoomId });

    // Použijeme .once() pro jednorázový listener, abychom předešli duplikátům
    socket.once('connect', () => {
      console.log("Socket připojen, odesílám 'join' pro vytvoření místnosti:", newRoomId);
      socket.emit('join', {
        roomId: newRoomId,
        videoId: videoId,
        user: userCredentials
      });
    });

    // Spustíme připojení
    socket.connect();
  }

  return (
    <Button 
      className="absolute bg-[#3B82F6] hover:bg-[#06B6D4] right-8 bottom-18 w-[4rem] h-[4rem] rounded-md cursor-pointer z-50" 
      onClick={handleClick}
    >
      <Plus className="w-[3rem] h-[3rem]" />
    </Button>
  );
}