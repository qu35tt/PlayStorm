import { useUserStore } from '@/stores/userStore';
import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// URL vašeho NestJS serveru a jmenného prostoru
const SOCKET_URL = 'http://localhost:80/WatchParty'; 

// Vytvoříme instanci socketu.
// Je definována *mimo* React komponentu, aby existovala jen jednou.
const socket = io(SOCKET_URL, {
  // Připojíme se manuálně až v useEffect, ne automaticky
  autoConnect: false, 
  
  // Zde posíláme autentizační token.
  // 'your-auth-token' nahraďte klíčem, pod kterým máte uložený JWT
  // (např. ze Supabase).
});

// Vytvoříme kontext pro socket
const SocketContext = createContext<Socket | null>(null);

/**
 * Vlastní hook pro snadný přístup k socketu z jakékoliv komponenty.
 */
export const useSocket = () => {
  const contextSocket = useContext(SocketContext);
  if (!contextSocket) {
    throw new Error('useSocket musí být použit uvnitř SocketProvider');
  }
  return contextSocket;
};

/**
 * Provider komponenta, která obalí vaši aplikaci (např. v main.tsx).
 * Postará se o připojení a odpojení socketu.
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Připojíme se, když se komponenta načte
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket připojen:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Chyba připojení socketu:', err.message);
    });

    // Čistící funkce: odpojíme se, když se komponenta odpojí
    return () => {
      socket.disconnect();
      console.log('Socket odpojen');
    };
  }, []); // Prázdné pole zajistí, že se spustí jen jednou

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};