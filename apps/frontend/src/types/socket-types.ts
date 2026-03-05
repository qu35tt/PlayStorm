// This type must match the User type in your UserContext
export type PartyUser = {
  id: string;
  username: string;
  avatarUrl: string;
};

export type JoinParty = {
  id: string;
  username: string;
  avatarUrl: string;
  roomId: string;
};

export type PlaybackData = {
    videoId: string
    currentTime: number
}

export type PlayerAction = {
 action: | 'PLAY' | 'PAUSE' | 'SEEK_FRW' | 'SEEK_BCK' | 'SEEK_TO',
 time?: number;
}

export type SyncState = {
  time: number;
  isPlaying: boolean;
  sentAt: number;
};

export interface ClientToServerEvents {
  createParty: (user: PartyUser) => void;
  joinParty: (data: JoinParty) => void;
  leaveParty: (roomId: string) => void;
  startPlayback: (data: PlaybackData) => void;
  playbackAction: (action: PlayerAction) => void;
  endPlayback: () => void;
  bufferingStatus: (isBuffering: boolean) => void;
  syncState: (data: SyncState) => void;
  kickUser: (usereId: string) => void;
}

export interface ServerToClientEvents {
  partyCreated: (payload: { roomId: string }) => void;
  newUserJoined: (payload: { userInfo: PartyUser }) => void;
  userLeft: (payload?: { userInfo: PartyUser }) => void;
  partyJoined: (payload?: { members: PartyUser[]; state?: { videoId: string, currentTime: number, isPlaying: boolean } }) => void;
  startPlayback: (payload?: { videoId: string }) => void;
  syncPlayback: (payload: PlayerAction & { isHeartbeat?: boolean }) => void;
  applySyncState: (payload: { time: number; isPlaying: boolean; sentAt: number }) => void;
  roomBuffering: (payload: { bufferingCount: number, totalCount: number }) => void;
  roomReady: () => void;
  endPlayback: () => void;
  roomNotFound: () => void;
  kicked: () => void;
  forcedLogout: (payload: { message: string }) => void;
  }