import { useEffect } from 'react';
import { useSocket } from '@/context/socket-context';
import { usePartyStore } from '@/stores/partyStore';
import { router } from '@/services/router';
import type { PartyUser, PlayerAction} from '@/types/socket-types';

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

    const onPartyJoined = (payload?: { members: PartyUser[]; state?: { videoId: string, currentTime: number, isPlaying: boolean } }) => {
      console.log("Party joined event received:", payload);
      if (payload?.members) {
        usePartyStore.getState().setMembers(payload.members);
      }
      
      if (payload?.state) {
        const { videoId, currentTime, isPlaying } = payload.state;
        const player = usePartyStore.getState().player;
        
        console.log("Applying initial state to player:", { videoId, currentTime, isPlaying, hasPlayer: !!player });

        if (videoId) usePartyStore.getState().setVideoId(videoId);
        
        if (player) {
          player.remoteControl.seek(currentTime);
          if (isPlaying) player.remoteControl.play();
          else player.remoteControl.pause();
        }
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

    const onPlaybackAction = (data: PlayerAction & { isHeartbeat?: boolean; isSyncResponse?: boolean }) => {
      console.log("Received playback action event:", data);
      const player = usePartyStore.getState().player;
      
      if (!player) {
        console.warn("Playback action received but player instance is not set in store yet.");
        return;
      }
      
      const targetTime = data.time ?? player.currentTime;

      // For heartbeats, only sync if drift is more than 2 seconds
      if (data.isHeartbeat) {
        const drift = Math.abs(player.currentTime - targetTime);
        if (drift < 2) return; 
        
        // Only sync time for heartbeat, don't force play/pause if it matches
        player.remoteControl.seek(targetTime);
        return;
      }

      switch(data.action){
        case 'PLAY': 
          player.remoteControl.seek(targetTime);
          player.remoteControl.play(); 
          break;
        case 'PAUSE': 
          player.remoteControl.seek(targetTime);
          player.remoteControl.pause(); 
          break;
        case 'SEEK_FRW': 
        case 'SEEK_BCK':
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

    const onRoomBuffering = (payload: { bufferingCount: number, totalCount: number }) => {
      console.log("Room is buffering:", payload);
      usePartyStore.getState().setRoomBuffering(true, payload.bufferingCount, payload.totalCount);

      const player = usePartyStore.getState().player;
      if (player && !player.paused) {
        player.remoteControl.pause();
      }
    };

    const onRoomReady = () => {
      console.log("Room is ready!");
      usePartyStore.getState().setRoomBuffering(false);

      const player = usePartyStore.getState().player;
      // We don't force play here, we just allow it. 
      // Actually, it's better to stay paused until someone clicks play OR if we were playing before.
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('partyCreated', onPartyCreated);
    socket.on('partyJoined', onPartyJoined);
    socket.on('newUserJoined', onNewUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('startPlayback', onStartPlayback);
    socket.on('endPlayback', onEndPlayback);
    socket.on('syncPlayback', onPlaybackAction);
    socket.on('roomBuffering', onRoomBuffering);
    socket.on('roomReady', onRoomReady);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('partyCreated', onPartyCreated);
      socket.off('partyJoined', onPartyJoined);
      socket.off('newUserJoined', onNewUserJoined);
      socket.off('userLeft', onUserLeft);
      socket.off('startPlayback', onStartPlayback);
      socket.off('endPlayback', onEndPlayback);
      socket.off('syncPlayback', onPlaybackAction);
      socket.off('roomBuffering', onRoomBuffering);
      socket.off('roomReady', onRoomReady);
    };
  }, [socket]);

  return null; 
};
