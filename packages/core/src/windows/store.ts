import { create } from 'zustand';
import { WindowState, WindowOptions, WindowBounds } from './types';

interface WindowStore {
  windows: Record<string, WindowState>;
  windowOrder: string[]; // Order of window IDs for z-index
  focusedWindowId: string | null;

  createWindow: (options: WindowOptions) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setWindowBounds: (id: string, bounds: Partial<WindowBounds>) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: {},
  windowOrder: [],
  focusedWindowId: null,

  createWindow: (options) => {
    const id = Math.random().toString(36).substring(7);
    const newWindow: WindowState = {
      id,
      appId: options.appId,
      title: options.title || 'Untitled',
      bounds: {
        x: options.x || 100,
        y: options.y || 100,
        width: options.width || 800,
        height: options.height || 600,
      },
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: get().windowOrder.length + 1,
      component: options.component,
    };

    set((state) => ({
      windows: { ...state.windows, [id]: newWindow },
      windowOrder: [...state.windowOrder, id],
      focusedWindowId: id,
    }));

    return id;
  },

  closeWindow: (id) => {
    set((state) => {
      const { [id]: _, ...remainingWindows } = state.windows;
      const newOrder = state.windowOrder.filter((wId) => wId !== id);
      return {
        windows: remainingWindows,
        windowOrder: newOrder,
        focusedWindowId: newOrder.length > 0 ? newOrder[newOrder.length - 1] : null,
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      if (state.focusedWindowId === id) return state;
      const newOrder = state.windowOrder.filter((wId) => wId !== id).concat(id);
      return {
        windowOrder: newOrder,
        focusedWindowId: id,
        windows: {
            ...state.windows,
            [id]: { ...state.windows[id], isMinimized: false }
        }
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMinimized: true, isFocused: false },
      },
      focusedWindowId: null, // Logic to focus next window could be added here
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMaximized: true, isMinimized: false },
      },
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMaximized: false, isMinimized: false },
      },
    }));
  },

  setWindowBounds: (id, bounds) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          bounds: { ...state.windows[id].bounds, ...bounds },
        },
      },
    }));
  },
}));
