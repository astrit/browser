declare global {
  interface Window {
    electron: {
      navigate: (url: string) => void;
      navigateBack: () => void;
      navigateForward: () => void;
      refresh: () => void;
    };
  }
}

export {};
