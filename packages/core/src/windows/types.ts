export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  bounds: WindowBounds;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  component?: any; // For internal React component mapping
}

export interface WindowOptions {
  appId: string;
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  component?: any;
}
