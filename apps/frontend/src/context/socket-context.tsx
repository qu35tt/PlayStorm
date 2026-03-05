import React, { createContext, useContext, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../lib/socket-instance';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-types';
import { usePartyStore } from '@/stores/party-store';
import { useUserStore } from '@/stores/user-store';

// Define the typed socket
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// 1. Create the Context
export const SocketContext = createContext<AppSocket>(socket);

// 2. Create the Provider Component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = usePartyStore((state) => state.user);
    const roomId = usePartyStore((state) => state.roomId);
    const token = useUserStore((state) => state.token);

    useEffect(() => {
    if (token) {
      if (!socket.connected) {
        socket.io.opts.extraHeaders = {
          Authorization: `Bearer ${token}`,
        };
        socket.connect();
      }

      const onConnect = () => {
        if (user && roomId) {
          socket.emit('joinParty', { ...user, roomId } as any);
        }
      };

      const onRoomNotFound = () => {
        usePartyStore.setState({ roomId: null });
      };

      socket.on('connect', onConnect);
      socket.on('roomNotFound', onRoomNotFound);

      if (socket.connected && user && roomId) {
        onConnect();
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('roomNotFound', onRoomNotFound);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [user, roomId, token]);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// 3. Create the Custom Hook
export const useSocket = (): AppSocket => {
  return useContext(SocketContext);
};