import React, { createContext, useContext, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../lib/SocketInstance'; // Your singleton instance
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-types';
import { usePartyStore } from '@/stores/partyStore';

// Define the typed socket
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// 1. Create the Context
export const SocketContext = createContext<AppSocket>(socket);

// 2. Create the Provider Component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
    const { user, roomId, initializeSocket } = usePartyStore.getState();

    if (user && roomId) {
      initializeSocket();
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