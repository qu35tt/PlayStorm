import { usePartyStore } from '../../stores/partyStore';
import { useModal } from "../../hooks/use-modal-store";
import { MemberCard } from "../MemberCard";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from '../ui/button';

  import { useUser } from "../../context/user-context";
  import { useUserStore } from "../../stores/userStore";

export function PartyModal() {
  const { isOpen, onClose, type } = useModal();
  const { userCredentials } = useUser();
  const { userId } = useUserStore();

  const isModalOpen = isOpen && type === 'party';

  const {
      roomId,
      members,
      user: currentUser, // This is the 'storeUser'
      setUser,
      initializeSocket,
      createParty,
    } = usePartyStore();


    function handleCreateParty() {
      if(!userCredentials || !userId) {
        console.warn("User is not logged in");
        return;
      }

      if(!currentUser) {
        setUser({...userCredentials, id: userId})
      }

      initializeSocket();

      createParty();
    }

    function handleJoinParty() {
      //here i open join party modal;

      console.log("Join party modal called!")
    }

  if(roomId != null) {
    return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent
          forceMount
          className="w-3/4 h-3/4 p-4"
        >
          <DialogHeader>
            <h2
              className="font-bold text-3xl text-center"
            >
              Party Menu
            </h2>
            <p
              className="text-gray-500/65 text-sm text-center"
            >
              ID: {roomId || 'Nejste v party'}
            </p>
            <div
              className="h-full flex flex-row space-x-4"
            >
              <div
                className="w-full h-full border-red-900 border-1 p-4 space-y-2 overflow-y-auto"
              >
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    user={member}
                    isSelf={member.id === currentUser?.id}
                  />
                ))}
              </div>
              <div
                className="w-full h-full border-red-900 border-1"
              >
                <h1>Chat</h1>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )}
  else {
    return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="w-3/4 h-3/4 p-4"
      >
        <DialogHeader>
          <h2
            className="font-bold text-3xl text-center"
          >
            Party Menu
          </h2>
          <div
            className="h-full w-full flex flex-col justify-center items-center space-y-4 scale-135"
          >
            <Button className='w-1/4' onClick={handleCreateParty}> Create Party! </Button>
            <Button className='w-1/4' onClick={handleJoinParty}> Join Party!</Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )}
}