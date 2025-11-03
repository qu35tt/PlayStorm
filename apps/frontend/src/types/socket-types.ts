// This type must match the User type in your UserContext
export type User = {
  username: string;
  avatarUrl: string;
};

// A user in a room, identifiable by their socket ID
export type RoomUser = User & {
  socketId: string;
};

// --- Events Server Sends to Client ---

export interface ServerToClientEvents {
  initpartystate: (state: {
    videoId: string;
    isPlaying: boolean;
    currentTime: number;
    lastUpdateTimestamp: number;
    users: RoomUser[]; // <-- Updated from 'user: any'
  }) => void;

  updatePartyState: (state: {
    isPlaying: boolean;
    time: number;
    timestamp: number;
  }) => void;

  playbackStarted: (state: {
    videoId: string;
    currentTime: number;
    timeStamp: number;
  }) => void;

  userJoined: (user: RoomUser) => void; // <-- Updated

  userLeft: (socketId: string) => void; // <-- Added

  roomUsersList: (users: RoomUser[]) => void;
}

// --- Events Client Sends to Server ---

export interface ClientToServerEvents {
  join: (payload: {
    roomId: string;
    videoId: string;
    user: User; // <-- Added user data from context
  }) => void;

  startPlayback: (payload: {
    roomId: string;
    videoId: string;
  }) => void;

  playbackAction: (payload: {
    roomId: string;
    action: 'play' | 'pause' | 'seek';
    time: number;
  }) => void;

  listRoomUsers: (payload: { roomId: string }) => void;
}