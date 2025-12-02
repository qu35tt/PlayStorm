// This type must match the User type in your UserContext
export type PartyUser = {
  id: string | null;
  username: string;
  avatarUrl: string;
};

export type JoinParty = PartyUser & {
  roomId: string;
};

export type PlaybackData = {
    videoId: string
    current_time: number
}

export type PlayerAction = {
 action: | 'PLAY' | 'PAUSE';
}

export interface ClientToServerEvents {
  create_party: (user: PartyUser) => void;
  join_party: (data: JoinParty) => void;
  leave_party: (roomId: string) => void;
  start_playback: (data: PlaybackData) => void;
  playback_action: (action: PlayerAction) => void;
}

export interface ServerToClientEvents {
  party_created: (payload: { roomId: string }) => void;
  new_user_joined: (payload: { userInfo: PartyUser }) => void;
  user_left: (payload?: { userInfo: PartyUser }) => void;
  party_joined: (payload?: {members: PartyUser[]}) => void;
  start_playback: (payload?: { videoId: string }) => void;
  sync_playback: (payload?: { action: PlayerAction }) => void;
}