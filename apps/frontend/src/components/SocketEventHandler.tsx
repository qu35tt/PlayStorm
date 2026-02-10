import { useEffect } from 'react';
import { useSocket } from '@/context/socket-context';
import { usePartyStore } from '@/stores/partyStore';
import { router } from '@/services/router';
import type { PartyUser, PlayerAction } from '@/types/socket-types';

export const SocketEventHandler = () => {
  const socket = useSocket();
  
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      usePartyStore.getState().setIsConnected(true);
      usePartyStore.getState().setError(null);
    };

    const onDisconnect = (reason: any) => {
      usePartyStore.getState().setIsConnected(false);
      usePartyStore.getState().setError(`Disconnected: ${reason}`);
    };

    const onPartyCreated = (payload: { roomId: string }) => {
      usePartyStore.getState().setRoomId(payload.roomId);
      const user = usePartyStore.getState().user;
      if (user) usePartyStore.getState().setMembers([user]);
    };

    const onPartyJoined = (payload?: { members: PartyUser[] }) => {
      if (payload?.members) {
        usePartyStore.getState().setMembers(payload.members);
      }
    };

    const onNewUserJoined = (payload?: { userInfo: PartyUser }) => {
      if (payload?.userInfo) {
        usePartyStore.getState().addMember(payload.userInfo);
      }
    };

    const onUserLeft = (payload?: { userInfo: PartyUser }) => {
      if (payload?.userInfo) {
        usePartyStore.getState().removeMember(payload.userInfo);
      }
    };

    const onStartPlayback = (payload?: { videoId: string }) => {
      if (payload?.videoId) {
        usePartyStore.getState().setVideoId(payload.videoId);
        router.navigate(`/watch/${payload.videoId}`);
      }
    };

    const onPlaybackAction = (data: PlayerAction) => {
      const player = usePartyStore.getState().player;
      console.log("Received playback action: ", data);

      if (!player) return;

      switch(data.action){
        case 'PLAY': player.remoteControl.play(); break;
        case 'PAUSE': player.remoteControl.pause(); break;
        case 'SEEK_FRW': player.remoteControl.seek(player.currentTime + 10); break;
        case 'SEEK_BCK': player.remoteControl.seek(player.currentTime - 10); break;
      }
    };

    const onEndPlayback = () => {
      usePartyStore.getState().setVideoId(null);
      router.navigate('/home');
    };

    const onKicked = () => {
      usePartyStore.getState().leaveParty();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('party_created', onPartyCreated);
    socket.on('party_joined', onPartyJoined);
    socket.on('new_user_joined', onNewUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('start_playback', onStartPlayback);
    socket.on('sync_playback', onPlaybackAction);
    socket.on('end_playback', onEndPlayback);
    socket.on('kicked', onKicked);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('party_created', onPartyCreated);
      socket.off('party_joined', onPartyJoined);
      socket.off('new_user_joined', onNewUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('start_playback', onStartPlayback);
      socket.off('sync_playback', onPlaybackAction);
      socket.off('end_playback', onEndPlayback);
      socket.off('kicked', onKicked);
    };
  }, [socket]);

  return null; 
};
