import { create } from 'zustand';

type ModalType = 'video' | null;

interface ModalStore {
  isOpen: boolean;
  type: ModalType;
  onOpen: (type: Exclude<ModalType, null>) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type) => set({isOpen: true, type}),
  onClose: () => set({type: null, isOpen: false})
}))