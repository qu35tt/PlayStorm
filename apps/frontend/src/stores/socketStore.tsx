import { create } from 'zustand';
import type { Socket } from 'socket.io-client';

/**
 * Typ pro účastníka party (musí odpovídat tomu, co posílá backend)
 */
export interface Participant {
  id: string;
  username: string;
  avatarUrl: string;
}

/**
 * Stav našeho store
 */
interface PartyState {
  roomId: string | null;
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
  
  /**
   * Nastaví posluchače na poskytnutý socket.
   * Tato funkce propojí Context a Store.
   */
  initializeListeners: (socket: Socket) => void;

  /**
   * Nastaví ID party a videa (např. při vstupu na stránku).
   * Samotné připojení ('join') se musí zavolat ručně přes socket.
   */
  setPartyDetails: (roomId: string, videoId: string) => void;

  /**
   * Vyčistí stav party (např. při odchodu).
   */
  clearParty: () => void;
}

export const useWatchPartyStore = create<PartyState>((set, get) => ({
  // Výchozí stav
  roomId: null,
  videoId: null,
  isPlaying: false,
  currentTime: 0,
  participants: [],

  // --- AKCE ---

  setPartyDetails: (roomId, videoId) => {
    set({ roomId, videoId });
  },

  clearParty: () => {
    set({
      roomId: null,
      videoId: null,
      isPlaying: false,
      currentTime: 0,
      participants: [],
    });
  },

  initializeListeners: (socket) => {
    /**
     * Server nám posílá kompletní stav při připojení.
     * POZNÁMKA: Váš kód na serveru používá 'initpartystate' (vše malými písmeny).
     */
    socket.on('initpartystate', (state: {
      videoId: string;
      isPlaying: boolean;
      time: number;
      participants: Participant[];
    }) => {
      set({
        videoId: state.videoId,
        isPlaying: state.isPlaying,
        currentTime: state.time,
        participants: state.participants,
      });
    });

    /**
     * Server posílá aktualizaci stavu přehrávače (play/pause/seek).
     */
    socket.on('updatePartyState', (state: { isPlaying: boolean; time: number }) => {
      set({
        isPlaying: state.isPlaying,
        currentTime: state.time,
      });
    });

    /**
     * Do místnosti se připojil nový uživatel.
     */
    socket.on('userJoined', (user: Participant) => {
      set((state) => ({
        participants: [...state.participants, user],
      }));
    });

    /**
     * Uživatel opustil místnost.
     */
    socket.on('userLeft', (userId: string) => {
      set((state) => ({
        participants: state.participants.filter(p => p.id !== userId),
      }));
    });

    /**
     * Pokud se odpojíme od serveru, vyčistíme stav party.
     */
    socket.on('disconnect', () => {
      get().clearParty();
      console.warn('Odpojeno od serveru, stav party vyčištěn.');
    });

    /**
     * Zachytávání obecných chyb z party.
     */
    socket.on('partyError', (error: { message: string }) => {
      console.error('Chyba party:', error.message);
      // Zde můžete zobrazit notifikaci uživateli
    });
  },
}));