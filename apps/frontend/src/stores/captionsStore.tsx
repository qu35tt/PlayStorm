import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define the shape of the styling options
export interface CaptionStyles {
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  verticalPosition: number; // Percentage from bottom
  fontWeight: string;
}

interface CaptionState {
  styles: CaptionStyles;
  currentCaptionText: string;
  
  updateStyle: <K extends keyof CaptionStyles>(key: K, value: CaptionStyles[K]) => void;
  setCaptionText: (text: string) => void;
  resetStyles: () => void;
}

export const useCaptionStore = create<CaptionState>()(
  persist(
    (set) => ({
      // Initial State
      styles: {
        fontSize: 24,
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        backgroundOpacity: 0.6,
        borderRadius: 8,
        verticalPosition: 10,
        fontWeight: 'font-medium',
      },
      currentCaptionText: "Your caption will appear here!",

      updateStyle: (key, value) =>
        set((state) => ({
          styles: {
            ...state.styles,
            [key]: value,
          },
        })),

      setCaptionText: (text) => set({ currentCaptionText: text }),

      resetStyles: () => set((state) => ({
        styles: {
          ...state.styles, // Keep current text, just reset visuals
          fontSize: 24,
          textColor: '#ffffff',
          backgroundColor: '#000000',
          backgroundOpacity: 0.6,
          borderRadius: 8,
          verticalPosition: 10,
          fontWeight: 'font-medium',
        }
      })),
    }),
    {
      name: 'caption-settings', // Unique name for localStorage key
    }
  )
);