import { useEffect } from 'react';
import { useSocket } from '../context/socket-context';
import { usePartyStore } from '../stores/partyStore';
import type { PartyUser } from '../types/socket-types';
import { useNavigate } from 'react-router';

export const SocketManager = () => {
  const socket = useSocket();
  const nav = useNavigate();

  useEffect(() => {
    const { user, roomId, initializeSocket } = usePartyStore.getState();

    if (user && roomId) {
      initializeSocket();
    }
  }, []);
  
  useEffect(() => {
    if (!socket) return;

    const onPartyCreated = ({ roomId }: { roomId: string }) => {
      console.log("Party created event received. Room ID:", roomId);
      usePartyStore.getState()._handlePartyCreated(roomId);
    };

    const onNewUserJoined = ({ userInfo }: { userInfo: PartyUser }) => {
      usePartyStore.getState()._handleNewUserJoined(userInfo);
    };

    const onUserLeft = (payload?: { userInfo: PartyUser }) => {
      if (payload?.userInfo) {
        usePartyStore.getState()._handleUserLeft(payload.userInfo);
      }
    };

    const onPartyJoined = (payload?: { members: PartyUser[] }) => {
      if (payload?.members) {
        usePartyStore.getState()._handlePartyJoined(payload.members);
      }
    };

    const onStartPlayback = (payload?: { videoId: string }) => {
      if (!payload) {
        console.error("Payload is undefined for start_playback event.");
        return;
      }
      usePartyStore.setState({ videoId: payload.videoId });
      usePartyStore.getState()._handleStart_playback(nav, payload.videoId);
    };

    socket.on('party_created', onPartyCreated);
    socket.on('new_user_joined', onNewUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('party_joined', onPartyJoined);
    socket.on('start_playback', onStartPlayback);

    return () => {
      socket.off('party_created', onPartyCreated);
      socket.off('new_user_joined', onNewUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('party_joined', onPartyJoined);
      socket.off('start_playback', onStartPlayback);
    };
  }, [socket]);

  return null; 
};