import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-types';

const URL =  import.meta.env.VITE_WEBSOCKET_URL;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false,
});