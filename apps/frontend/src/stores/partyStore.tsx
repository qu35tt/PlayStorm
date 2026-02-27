import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  PartyUser,
  PlayerAction,
} from '../types/socket-types';
import { socket } from '../lib/SocketInstance';
import { MediaPlayerInstance } from '@vidstack/react';
import { useUserStore } from './userStore';

export type PartyStore = {
  isConnected: boolean;
  user: PartyUser | null;
  roomId: string | null;
  videoId: string | null;
  hostId: string | null;
  members: PartyUser[];
  error: string | null;
  // remote: MediaRemoteControl | null;
  // setRemote: (remote: MediaRemoteControl) => void;
  player: MediaPlayerInstance | null;
  setUser: (user: PartyUser) => void;
  setRoomId: (roomId: string | null) => void;
  setVideoId: (videoId: string | null) => void;
  setHostId: (hostId: string | null) => void;
  setMembers: (members: PartyUser[]) => void;
  setPlayer: (player: MediaPlayerInstance) => void;
  addMember: (user: PartyUser) => void;
  removeMember: (user: PartyUser) => void;
  setIsConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  connect: () => void;
  disconnect: () => void;
  createParty: () => Promise<void>;
  joinParty: (roomId: string) => Promise<void>;
  leaveParty: () => void;
  startPlayback: (videoId: string) => void;
  playbackAction: (action: PlayerAction) => void;
  endPlayback: () => void;
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
      hostId: null,
      members: [],
      error: null,
      player: null,
      setUser: (user) => {
        set({ user });
      },

      setPlayer: (player: MediaPlayerInstance) => {
        set({ player });
        console.log("Player instance set in store: ", player);
      },

      setRoomId: (roomId) => set({ roomId }),
      setVideoId: (videoId) => set({ videoId }),
      setHostId: (hostId) => set({ hostId }),
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
        const token = useUserStore.getState().token;
        if (token) {
          socket.io.opts.extraHeaders = {
            ...socket.io.opts.extraHeaders,
            authorization: `Bearer ${token}`,
          };
        }
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
            socket.emit('createParty', user);
            resolve();
          } else {
            set({ error: 'Cannot create party. Not connected or no user info.' });
            reject(new Error(socket.connected + ' ' + user));
          }})
      },

      joinParty: (roomId) => {
        return new Promise<void>((resolve, reject) => {
          const { user } = get();
          if (socket.connected && user && user.id) {
            socket.emit('joinParty', { ...user, roomId });
            set({ roomId });
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
          socket.emit('leaveParty', roomId);
        }
      },

      startPlayback: (videoId: string) => {
        set({
          videoId
        });

        if(socket && videoId){
          socket.emit('startPlayback', { videoId, currentTime: 0 });
        }
      },

      playbackAction: (action: PlayerAction) => {
        socket.emit('playbackAction', action)
        console.log("Emitted playback action: ", action)
      },

      endPlayback: () => {
        const id = get().roomId
        console.log("End playback was called in room: ", id)
        socket.emit('endPlayback', id!)
      },
    }),
    {
      name: 'party-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user || null,
        roomId: state.roomId || null,
        videoId: state.videoId || null,
        hostId: state.hostId || null,
        members: state.members || [],
      }),
    },
  ),
);