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

export interface ClientToServerEvents {
  createParty: (user: PartyUser) => void;
  joinParty: (data: JoinParty) => void;
  leaveParty: (roomId: string) => void;
  startPlayback: (data: PlaybackData) => void;
  playbackAction: (action: PlayerAction) => void;
  kickUser: (usereId: string) => void;
  endPlayback: (roomId: string) => void;
}

export interface ServerToClientEvents {
  partyCreated: (payload: { roomId: string; hostId: string }) => void;
  newUserJoined: (payload: { userInfo: PartyUser }) => void;
  userLeft: (payload?: { userInfo: PartyUser }) => void;
  partyJoined: (payload?: { members: PartyUser[]; hostId: string }) => void;
  startPlayback: (payload?: { videoId: string }) => void;
  syncPlayback: (payload: PlayerAction) => void;
  endPlayback: () => void;
  roomNotFound: () => void;
  kicked: () => void;
  newHost: (payload: { hostId: string }) => void;
}