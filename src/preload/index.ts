import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  newWindow: (): void => {
    ipcRenderer.send('new-window')
  },
  openNotesWindow: (): void => {
    ipcRenderer.send('open-notes-window')
  },
  openCmdWindow: (): void => {
    ipcRenderer.send('open-cmd-window')
  },
  setTransparencyMode: (enabled: boolean): void => {
    ipcRenderer.send('set-transparency-mode', enabled)
  },
  setCloseToMenuBar: (enabled: boolean): void => {
    ipcRenderer.send('set-close-to-menubar', enabled)
  },
  setMenuBarVisible: (enabled: boolean): void => {
    ipcRenderer.send('set-menubar-visible', enabled)
  },
  getAppPreferences: async (): Promise<{ closeToMenuBar: boolean; menuBarVisible: boolean }> => {
    const preferences = await ipcRenderer.invoke('get-app-preferences')
    return preferences as { closeToMenuBar: boolean; menuBarVisible: boolean }
  },
  onOpenSettings: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('open-settings', listener)

    return () => {
      ipcRenderer.removeListener('open-settings', listener)
    }
  },
  onAppPreferences: (
    callback: (preferences: { closeToMenuBar: boolean; menuBarVisible: boolean }) => void
  ): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, preferences: unknown): void => {
      callback(preferences as { closeToMenuBar: boolean; menuBarVisible: boolean })
    }

    ipcRenderer.on('app-preferences', listener)

    return () => {
      ipcRenderer.removeListener('app-preferences', listener)
    }
  },
  openDevTools: (): void => {
    ipcRenderer.send('open-devtools')
  },
  closeDevTools: (): void => {
    ipcRenderer.send('close-devtools')
  },
  closeWindow: (): void => {
    ipcRenderer.send('close-window')
  },
  onCmdQ: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('cmd-q', listener)
    return () => {
      ipcRenderer.removeListener('cmd-q', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
