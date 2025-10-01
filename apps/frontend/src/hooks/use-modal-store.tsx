import { create } from 'zustand';

type ModalType = 'video' | null;

interface ModalStore {
  isOpen: boolean;
  type: ModalType;
  videoId: string | null;
  onOpen: (type: Exclude<ModalType, null>, videoId: string) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  videoId: null,
  onOpen: (type, videoId) => set({isOpen: true, type, videoId}),
  onClose: () => set({type: null, isOpen: false, videoId: null}),
}))