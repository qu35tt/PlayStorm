import { useEffect } from 'react';
import { useSocket } from '../context/socket-context';
import { usePartyStore } from '../stores/partyStore';
import type { RoomUser, PlaybackState } from '../types/socket-types';

// This component renders nothing. Its only job is to sync
// socket events to the Zustand store.
export const SocketManager = () => {
  const socket = useSocket();
  const { setParty, addUser, removeUser, clearParty, setPlaybackState } = usePartyStore();

  useEffect(() => {
    // This handler now expects the full state from the server
    const onInitPartyState = (state: any) => {
      console.log('SocketManager: Received initpartystate', state);
      setParty(state);
    };

    const onUserJoined = (user: RoomUser) => {
      console.log('SocketManager: User joined', user);
      addUser(user);
    };

    const onUserLeft = (socketId: string) => {
      console.log('SocketManager: User left', socketId);
      removeUser(socketId);
    };

    const onDisconnect = () => {
      console.log('SocketManager: Disconnected');
      clearParty();
    };

    const onPlaybackStarted = (data: Partial<PlaybackState> & { timeStamp: number }) => {
      setPlaybackState({
        videoId: data.videoId,
        currentTime: data.currentTime,
        isPlaying: true,
        lastUpdateTimestamp: data.timeStamp,
      });
    };

    // Attach all listeners
    socket.on('initpartystate', onInitPartyState);
    socket.on('userJoined', onUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('disconnect', onDisconnect);
    socket.on('playbackStarted', onPlaybackStarted)


    // Cleanup
    return () => {
      socket.off('initpartystate', onInitPartyState);
      socket.off('userJoined', onUserJoined);
      socket.off('userLeft', onUserLeft);
      socket.off('disconnect', onDisconnect);
      socket.off('playbackStarted', onPlaybackStarted)
    };
  }, [socket, setParty, addUser, removeUser, clearParty]);

  return null; // Renders nothing
};