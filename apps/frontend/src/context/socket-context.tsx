import React, { createContext, useContext, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../lib/SocketInstance';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-types';
import { usePartyStore } from '@/stores/partyStore';
import { useUserStore } from '@/stores/userStore';

// Define the typed socket
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// 1. Create the Context
export const SocketContext = createContext<AppSocket>(socket);

// 2. Create the Provider Component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
    const { user, roomId } = usePartyStore.getState();
    const token = useUserStore.getState().token;

    if (user && roomId) {
      if (!socket.connected) {
        if (token) {
          socket.io.opts.extraHeaders = {
            Authorization: `Bearer ${token}`,
          };
        }
        socket.connect();
      }

      const onConnect = () => {
        socket.emit('joinParty', { ...user, roomId } as any);
      };

      const onRoomNotFound = () => {
        usePartyStore.setState({ roomId: null });
      };

      socket.on('connect', onConnect);
      socket.on('roomNotFound', onRoomNotFound);

      if (socket.connected) {
        onConnect();
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('roomNotFound', onRoomNotFound);
      };
    }
  }, []);
  
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