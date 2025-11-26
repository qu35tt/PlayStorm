import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-types';

// 1. Get the server URL from environment variables
// In your .env.local file, you should have:
// VITE_WEBSOCKET_URL=http://localhost:80
const URL =  'http://localhost:80/Party';

// 2. Create and type the socket instance
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  
  // We set autoConnect to false.
  // This allows React to decide WHEN to initiate the connection
  // (e.g., when a user joins a room) by calling socket.connect()
  autoConnect: false,
});