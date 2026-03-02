import { create } from 'zustand';

export type CursorState = 'default' | 'button' | 'text' | 'loading' | 'disabled' | 'link';

interface CursorStore {
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
}

export const useCursorStore = create<CursorStore>((set) => ({
  cursorState: 'default',
  setCursorState: (state) => set({ cursorState: state }),
  isHidden: false,
  setIsHidden: (hidden) => set({ isHidden: hidden }),
}));

// Simple hook for components to use
export function useCursor() {
  const { cursorState, setCursorState, isHidden, setIsHidden } = useCursorStore();
  
  return {
    cursorState,
    setCursorState,
    isHidden,
    setIsHidden,
  };
}

// Utility to add cursor attributes to elements
export const cursorAttributes = {
  button: { 'data-cursor': 'button' } as const,
  text: { 'data-cursor': 'text' } as const,
  loading: { 'data-cursor': 'loading' } as const,
  link: { 'data-cursor': 'link' } as const,
};
