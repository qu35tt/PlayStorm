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

    const onPartyCreated = (payload: { roomId: string; hostId: string }) => {
      usePartyStore.getState().setRoomId(payload.roomId);
      usePartyStore.getState().setHostId(payload.hostId);
      const user = usePartyStore.getState().user;
      if (user) usePartyStore.getState().setMembers([user]);
    };

    const onPartyJoined = (payload?: { members: PartyUser[]; hostId: string }) => {
      if (payload?.members) {
        usePartyStore.getState().setMembers(payload.members);
      }
      if (payload?.hostId) {
        usePartyStore.getState().setHostId(payload.hostId);
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

    const onNewHost = (payload: { hostId: string }) => {
      if (payload.hostId) {
        usePartyStore.getState().setHostId(payload.hostId);
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
        case 'SEEK_TO':
          if(data.time !== undefined){
            player.remoteControl.seek(data.time);
          }
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
    socket.on('partyCreated', onPartyCreated);
    socket.on('partyJoined', onPartyJoined);
    socket.on('newUserJoined', onNewUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('startPlayback', onStartPlayback);
    socket.on('syncPlayback', onPlaybackAction);
    socket.on('endPlayback', onEndPlayback);
    socket.on('kicked', onKicked);
    socket.on('newHost', onNewHost);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('partyCreated', onPartyCreated);
      socket.off('partyJoined', onPartyJoined);
      socket.off('newUserJoined', onNewUserJoined);
      socket.off('userLeft', onUserLeft);
      socket.off('startPlayback', onStartPlayback);
      socket.off('syncPlayback', onPlaybackAction);
      socket.off('endPlayback', onEndPlayback);
      socket.off('kicked', onKicked);
      socket.off('newHost', onNewHost);
    };
  }, [socket]);

  return null; 
};
