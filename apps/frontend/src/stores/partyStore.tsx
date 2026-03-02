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
  members: PartyUser[];
  isRoomBuffering: boolean;
  bufferingCount: number;
  totalCount: number;
  error: string | null;
  player: MediaPlayerInstance | null;
  lastActionTime: number;
  setUser: (user: PartyUser) => void;
  setRoomId: (roomId: string | null) => void;
  setVideoId: (videoId: string | null) => void;
  setMembers: (members: PartyUser[]) => void;
  setPlayer: (player: MediaPlayerInstance) => void;
  setRoomBuffering: (isBuffering: boolean, count?: number, total?: number) => void;
  bufferingStatus: (isBuffering: boolean) => void;
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
  syncState: (data: { time: number; isPlaying: boolean }) => void;
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
      members: [],
      isRoomBuffering: false,
      bufferingCount: 0,
      totalCount: 0,
      messages: [],
      error: null,
      player: null,
      lastActionTime: 0,
      setUser: (user) => {
        set({ user });
      },

      setPlayer: (player: MediaPlayerInstance) => {
        set({ player });
        console.log("Player instance set in store: ", player);
      },

      setRoomId: (roomId) => set({ roomId }),
      setVideoId: (videoId) => set({ videoId }),
      setMembers: (members) => set({ members }),

      setRoomBuffering: (isBuffering, count = 0, total = 0) => set({ 
        isRoomBuffering: isBuffering, 
        bufferingCount: count, 
        totalCount: total 
      }),

      bufferingStatus: (isBuffering) => {
        if (socket.connected) {
          socket.emit('bufferingStatus', { isBuffering } as any);
        }
      },

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
        set({ videoId });

        if (socket && videoId) {
          socket.emit('startPlayback', { videoId, currentTime: 0 });
        }
      },

      playbackAction: (action: PlayerAction) => {
        const player = get().player;
        
        // Use provided time if available, otherwise fallback to player's current time
        const time = action.time !== undefined ? action.time : (player?.currentTime ?? 0);

        set({ lastActionTime: Date.now() });
        socket.emit('playbackAction', { ...action, time });
        console.log("Emitted playback action: ", { ...action, time });
      },

      syncState: (data: { time: number; isPlaying: boolean }) => {
        if (socket) {
          socket.emit('syncState', { ...data, sentAt: Date.now() } as any);
        }
      },

      endPlayback: () => {
        const id = get().roomId
        console.log("End playback was called in room: ", id)
        socket.emit('endPlayback')
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