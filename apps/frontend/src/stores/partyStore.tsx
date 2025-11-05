import { create } from 'zustand';
import type { RoomUser, PlaybackState } from '../types/socket-types'; // Make sure this path is correct

// This should match your server's 'RoomStates' type


type PartyStore = {
  roomId: string | null;
  users: RoomUser[];
  playbackState: PlaybackState | null;
  setParty: (payload: { roomId: string; users: RoomUser[] } & PlaybackState) => void;
  setPlaybackState: (payload: Partial<PlaybackState>) => void;
  addUser: (user: RoomUser) => void;
  removeUser: (socketId: string) => void;
  clearParty: () => void;
};

const initialState = {
  roomId: null,
  users: [],
  playbackState: null,
};

export const usePartyStore = create<PartyStore>((set) => ({
  ...initialState,

  // Called by 'initpartystate'
  setParty: (payload) => set({
    roomId: payload.roomId,
    users: payload.users,
    playbackState: {
      videoId: payload.videoId,
      isPlaying: payload.isPlaying,
      currentTime: payload.currentTime,
      lastUpdateTimestamp: payload.lastUpdateTimestamp,
    }
  }),

    // Added to the type and fixed to handle partial payloads
  setPlaybackState: (payload) =>
    set((state) => ({
      playbackState: state.playbackState
        ? { ...state.playbackState, ...payload }
        : {
            videoId: payload.videoId || '',
            currentTime: payload.currentTime || 0,
            isPlaying: payload.isPlaying || false,
            lastUpdateTimestamp: payload.lastUpdateTimestamp || Date.now(),
          },
    })),

  addUser: (user) =>
    set((state) =>
      state.users.some((u) => u.socketId === user.socketId)
        ? state
        : { users: [...state.users, user] }
    ),

  // Called by 'userLeft'
  removeUser: (socketId) => set((state) => ({
    users: state.users.filter((u) => u.socketId !== socketId)
  })),

  // Called on disconnect
  clearParty: () => set(initialState),
}));