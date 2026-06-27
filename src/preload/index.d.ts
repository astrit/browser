import { ElectronAPI } from '@electron-toolkit/preload'

interface CoreAPI {
  newWindow: () => void
  openNotesWindow: () => void
  setTransparencyMode: (enabled: boolean) => void
  setCloseToMenuBar: (enabled: boolean) => void
  setMenuBarVisible: (enabled: boolean) => void
  getAppPreferences: () => Promise<{ closeToMenuBar: boolean; menuBarVisible: boolean }>
  onOpenSettings: (callback: () => void) => () => void
  onAppPreferences: (
    callback: (preferences: { closeToMenuBar: boolean; menuBarVisible: boolean }) => void
  ) => () => void
  openDevTools: () => void
  closeDevTools: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CoreAPI
  }
}
