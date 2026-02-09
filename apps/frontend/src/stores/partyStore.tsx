import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  PartyUser,
  PlaybackData,
  PlayerAction,
} from '../types/socket-types';
import { socket } from '../lib/SocketInstance'; // Import the singleton socket
import { MediaRemoteControl } from '@vidstack/react';

export type PartyStore = {
  isConnected: boolean;
  user: PartyUser | null;
  roomId: string | null;
  videoId: string | null;
  members: PartyUser[];
  error: string | null;
  remote: MediaRemoteControl | null;
  setRemote: (remote: MediaRemoteControl) => void;
  setUser: (user: PartyUser) => void;
  setRoomId: (roomId: string | null) => void;
  setVideoId: (videoId: string | null) => void;
  setMembers: (members: PartyUser[]) => void;
  addMember: (user: PartyUser) => void;
  removeMember: (user: PartyUser) => void;
  setIsConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  connect: () => void;
  disconnect: () => void;
  createParty: () => Promise<void>;
  joinParty: (roomId: string) => Promise<void>;
  leaveParty: () => void;
  start_playback: (videoId: string) => void;
  playback_action: (action: PlayerAction) => void;
  end_playback: () => void;
};

type PersistedData = {
  user: PartyUser | null;
  roomId: string | null;
  videoId: string | null;
}

export const usePartyStore = create<PartyStore, [["zustand/persist", PersistedData]]>(
  persist(
    (set, get) => ({
      isConnected: false,
      user: null,
      roomId: null,
      videoId: null,
      members: [],
      error: null,
      remote: null,
      setUser: (user) => {
        set({ user });
      },

      setRemote: (remote) => {
        set({remote});
        remote.setTarget(remote.getPlayer());
      },

      setRoomId: (roomId) => set({ roomId }),
      setVideoId: (videoId) => set({ videoId }),
      setMembers: (members) => set({ members }),
      
      addMember: (userInfo) => {
        set((state) => {
          const userExists = state.members.some((member) => member.id === userInfo.id);
          if (userExists) return {};
          return { members: [...state.members, userInfo] };
        });
      },

      removeMember: (userInfo) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== userInfo.id),
        }));
      },

      setIsConnected: (isConnected) => set({ isConnected }),
      setError: (error) => set({ error }),

      connect: () => {
        if (!socket.connected) {
          socket.connect();
        }
      },

      disconnect: () => {
        if (socket) {
          socket.disconnect();
        }
        set({
          isConnected: false,
          roomId: null,
          members: [],
        });
      },

      createParty: () => {
        return new Promise<void>((resolve, reject) => {
          const { user } = get();
          if (socket.connected && user) {
            socket.emit('create_party', user);
            resolve();
          } else {
            set({ error: 'Cannot create party. Not connected or no user info.' });
            reject(new Error(socket.connected + ' ' + user));
          }})
      },

      joinParty: (roomId) => {
        return new Promise<void>((resolve, reject) => {
          const { user } = get();
          if (socket.connected && user) {
            socket.emit('join_party', { ...user, roomId });
            set({ roomId }); // Set only the roomId, let the server be the source of truth for members
            resolve();
          } else {
            const errorMsg = 'Cannot join party. Not connected or no user info.';
            set({ error: errorMsg });
            reject(new Error(errorMsg));
          }
        });
      },

      leaveParty: () => {
        const { roomId } = get();
        if (socket && roomId) {
          set({ roomId: null, members: [], videoId: null });
          socket.emit('leave_party', roomId);
        }
      },

      start_playback: (videoId: string) => {
        set({
          videoId
        });

        if(socket && videoId){
          socket.emit('start_playback', { videoId, current_time: 0 });
        }
      },

      playback_action: (action: PlayerAction) => {
        socket.emit('playback_action', action)
      },

      end_playback: () => {
        const id = get().roomId
        console.log("End playback was called in room: ", id)
        socket.emit('end_playback', id!)
      },
    }),
    {
      name: 'party-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user || null,
        roomId: state.roomId || null,
        videoId: state.videoId || null,
        members: state.members || [],
      }),
    },
  ),
);