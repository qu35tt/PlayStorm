import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PartyUser,
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
  createParty: () => void;
  joinParty: (roomId: string) => Promise<void>;
  leaveParty: () => void;
  // Actions to be called by SocketManager
  _handlePartyCreated: (roomId: string) => void;
  _handleNewUserJoined: (userInfo: PartyUser) => void;
  _handleUserLeft: (userInfo: PartyUser) => void;
  _handlePartyJoined: (members: PartyUser[]) => void;
  start_playback: () => void;
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
        const { user } = get();
        if (socket.connected && user) {
          socket.emit('create_party', user);
        } else {
          set({ error: 'Cannot create party. Not connected or no user info.' });
        }
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
          set({ roomId: null, members: [] });
          socket.emit('leave_party', roomId); // Pass the roomId to the server
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
        set((state) => ({
          members: [...state.members, userInfo],
        }));
      },

      _handleUserLeft: (userInfo) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== userInfo.id),
        }));
      },

      _handlePartyJoined: (members) => {
        set({ members });
      },

      start_playback: () => {
        const { videoId } = get();
        console.log("The method was called");
        if (videoId) {
          window.location.href = `http://localhost:5173/watch/${videoId}`;
        } else {
          console.error("Cannot start playback: videoId is not set.");
        }
      },
    }),
    {
      name: 'party-store',
      partialize: (state) => ({
        user: state.user || null,
        roomId: state.roomId || null,
        videoId: state.videoId || null,
        members: state.members || [],
      }),
    },
  ),
);