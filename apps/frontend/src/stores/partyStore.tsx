import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  PartyUser,
  PlaybackData,
} from '../types/socket-types';
import { socket } from '../lib/SocketInstance'; // Import the singleton socket

export type PartyStore = {
  isConnected: boolean;
  user: PartyUser | null;
  roomId: string | null;
  videoId: string | null;
  members: PartyUser[];
  error: string | null;
  setUser: (user: PartyUser) => void;
  initializeSocket: () => void;
  disconnect: () => void;
  createParty: () => Promise<void>;
  joinParty: (roomId: string) => Promise<void>;
  leaveParty: () => void;
  start_playback: (videoId: string) => void;
  // Actions to be called by SocketManager
  _handlePartyCreated: (roomId: string) => void;
  _handleNewUserJoined: (userInfo: PartyUser) => void;
  _handleUserLeft: (userInfo: PartyUser) => void;
  _handlePartyJoined: (members: PartyUser[]) => void;
  _handleStart_playback: (navigate: any, data: PlaybackData) => void;
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
      setUser: (user) => {
        set({ user });
      },

      initializeSocket: () => {
        if (socket.connected) {
          return;
        }

        socket.on('connect', () => {
          set({ isConnected: true, error: null });
        });

        socket.on('disconnect', (reason) => {
          set({ isConnected: false, error: `Disconnected: ${reason}` });
        });

        socket.connect();
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
      // These actions will be called from SocketManager
      _handlePartyCreated: (roomId) => {
        const currentUser = get().user;
        set({
          roomId,
          members: currentUser ? [currentUser] : [],
        });
        
      },

      _handleNewUserJoined: (userInfo) => {
        set((state) => {
          const userExists = state.members.some((member) => member.id === userInfo.id);
          if (userExists) {
            return {};
          }

          return {
            members: [...state.members, userInfo],
          };
        });
      },

      _handleUserLeft: (userInfo) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== userInfo.id),
        }));
      },

      _handlePartyJoined: (members) => {
        set({ members });
      },

      _handleStart_playback: (navigate: any, data: PlaybackData) => {
        console.log("start_playback")
        console.log("video ID:", data.videoId)
        if (data.videoId) {
           navigate(`/watch/${data.videoId}`)
        } else {
          console.error("Cannot start playback: videoId is not set.");
        }
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