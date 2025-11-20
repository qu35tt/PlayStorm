import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  PartyUser,
} from '../types/socket-types';

export type PartyStore = {
  socket: Socket | null;
  isConnected: boolean;
  user: PartyUser | null;
  roomId: string | null;
  members: PartyUser[];
  error: string | null;
  setUser: (user: PartyUser) => void;
  initializeSocket: () => void;
  disconnect: () => void;
  createParty: () => void;
  joinParty: (roomId: string) => Promise<void>;
  leaveParty: () => void;
};

const SOCKET_URL = 'http://localhost:80/Party';

export const usePartyStore = create<PartyStore>((set, get) => ({
  socket: null,
  isConnected: false,
  user: null,
  roomId: null,
  members: [],
  error: null,

  setUser: (user) => {
    set({ user });
  },

  initializeSocket: () => {
    if (get().socket) {
      return;
    }

    const user = get().user;
    if (!user) {
      set({ error: 'User info must be set before connecting.' });
      return;
    }

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      SOCKET_URL,
      {
        autoConnect: false,
      },
    );

    socket.on('connect', () => {
      set({ isConnected: true, error: null });
    });

    socket.on('disconnect', (reason) => {
      set({
        isConnected: false,
        error: `Disconnected: ${reason}`,
        roomId: null,
        members: [],
      });
    });

    socket.on('party_created', ({ roomId }) => {
      const currentUser = get().user;
      set({
        roomId,
        members: currentUser ? [currentUser] : [],
      });
    });

    socket.on('new_user_joined', ({ userInfo }) => {
      set((state) => ({
        members: [...state.members, userInfo],
      }));
    });

    socket.on('user_left', (payload) => {
      if (payload && payload.userInfo) {
        
        set((state) => ({
          members: state.members.filter(
            (m) => m.id != payload.userInfo.id,
          ),
        }));
      } else {
        console.warn(
          "Received 'user_left' event with no payload. Member list may be inaccurate.",
        );
      }
    });

    socket.on('party_joined', (payload) => {
      set({
        members: payload?.members
      })
    })

    socket.connect();
    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }
    set({
      socket: null,
      isConnected: false,
      roomId: null,
      members: [],
    });
  },

  createParty: () => {
    const { socket, user } = get();
    if (socket && user) {
      socket.emit('create_party', user);
    } else {
      set({ error: 'Cannot create party. Not connected or no user info.' });
    }
  },

  joinParty: (roomId) => {
    return new Promise<void>((resolve, reject) => {
    const { socket, user } = get();
    console.log(user);
    if (socket && user) {
      socket.emit('join_party', { ...user, roomId });
      set({
        roomId,
        members: [user], 
      });
      resolve();
    } else {
      const errorMsg = 'Cannot join party. Not connected or no user info.';
      set({ error: errorMsg });
      reject(new Error(errorMsg));
    }
    })
  },

  leaveParty: () => {
    const { socket } = get();
    if (socket) {
      set({ roomId: null, members: [] });
      socket.emit('leave_party');
    }
  },
}));