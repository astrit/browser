import { ElectronAPI } from '@electron-toolkit/preload'

interface CoreAPI {
  newWindow: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CoreAPI
  }
}
