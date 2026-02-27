import { usePartyStore } from '@/stores/partyStore';
import { useModal } from "@/hooks/use-modal-store";
import { MemberCard } from "../MemberCard";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { useUser } from "@/context/user-context";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from 'react';
import { useSocket } from "@/context/socket-context";
import type { PartyUser } from '@/types/socket-types';

export function PartyModal() {
  const { isOpen, onClose, onOpen, type } = useModal();
  const { userCredentials } = useUser();
  const { id } = useUserStore();

  const isModalOpen = isOpen && type === 'party';
  const socket = useSocket();

  const {
      roomId,
      members,
      user: currentUser, // This is the 'storeUser'
      setUser,
      connect,
      createParty,
      leaveParty,
    } = usePartyStore();

    async function socketConnection() {
      if(!userCredentials || !id) {
        console.warn("User is not logged in");
        return;
      }

      if(!currentUser) {
        console.log("user credentials: ", {...userCredentials, id: id})
        setUser({...userCredentials, id: id})
      }

      connect();
    }

    socketConnection();

    function socketDisconnection() {
      console.log("socketDisconnection");
      
      leaveParty();
    }

    async function handleCreateParty() {
      try {
        await createParty();
        toast.success("Party byla úspěšně vytvořena!");
      } catch(err) {
        console.log(err);
      }
      
    }

    function handleJoinParty() {
      socketConnection();
      onOpen("joinParty", "");
    }

    function handleLeaveParty() {
      socketDisconnection();
    }

    useEffect(() => {
      console.log("Room ID changed:", roomId);
      socketConnection();
    }, []);

    useEffect(() => {
      if (!socket) return;

      const handlePartyJoined = (payload?: { members: PartyUser[]; hostId: string }) => {
        if (payload?.members) {
          usePartyStore.setState({ members: payload.members });
        }
      };

      const handleNewUserJoined = (data: { userInfo: PartyUser }) => {
        const { members } = usePartyStore.getState();
        if (!members.some((m) => m.id === data.userInfo.id)) {
          usePartyStore.setState({ members: [...members, data.userInfo] });
          toast.success(`${data.userInfo.username} joined the party!`);
        }
      };

      const handleUserLeft = (payload?: { userInfo: PartyUser }) => {
        if (!payload?.userInfo) return;
        const { members } = usePartyStore.getState();
        usePartyStore.setState({ members: members.filter((m) => m.id !== payload.userInfo.id) });
        toast.info(`${payload.userInfo.username} left the party.`);
      };

      socket.on('partyJoined', handlePartyJoined);
      socket.on('newUserJoined', handleNewUserJoined);
      socket.on('userLeft', handleUserLeft);

      return () => {
        socket.off('partyJoined', handlePartyJoined);
        socket.off('newUserJoined', handleNewUserJoined);
        socket.off('userLeft', handleUserLeft);
      };
    }, [socket]);

  if(roomId != null) {
    return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent
          forceMount
          className="w-1/4 h-3/4 p-4 flex flex-col bg-[#0E111A] border-0 text-white"
        >
          <DialogHeader className="flex-grow">
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
                className="w-full h-full flex flex-col p-4 space-y-2 overflow-y-auto"
              >
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    user={member}
                    isSelf={member.id === currentUser?.id}
                  />
                ))}
              </div>
              {/* <Separator orientation='vertical' />
              <div
                className="w-full h-full"
              >
                <Chat />
              </div> */}
            </div>
          </DialogHeader>
          <DialogFooter className="w-full">
            <Button className="w-full bg-red-600 hover:bg-gray-500" onClick={handleLeaveParty}>Leave Party</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  else {
    return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent
        forceMount
        className="w-1/4 h-1/4 bg-[#0E111A] border-0 text-white focus:outline-0"
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
            <Button className='w-2/4' onClick={handleCreateParty}> Create Party! </Button>
            <Button className='w-2/4' onClick={handleJoinParty}> Join Party!</Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )}
}