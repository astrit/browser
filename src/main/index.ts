// import { app, shell, ipcMain } from 'electron'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import { BrowserWindow } from 'electron-acrylic-window';
import icon from '../../512x512.png?asset'

const applyTransparencyMode = (targetWindow: BrowserWindow, enabled: boolean): void => {
  if (process.platform === 'darwin') {
    targetWindow.setVibrancy(enabled ? null : 'fullscreen-ui')
  }

  if (process.platform === 'win32') {
    const withMaterial = targetWindow as unknown as {
      setBackgroundMaterial?: (material: 'none' | 'acrylic') => void
    }

    withMaterial.setBackgroundMaterial?.(enabled ? 'none' : 'acrylic')
  }

  targetWindow.setBackgroundColor('#00000000')
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  const newWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true
    },
    vibrancy: 'fullscreen-ui', // on MacOS
    backgroundMaterial: 'acrylic', // on Windows 11
    // titleBarStyle: 'hidden',
    // trafficLightPosition: { x: 20, y: 20 },
    // trafficLightPosition: { x: 20, y: 20 },
    transparent: true,
    hasShadow: false,
    roundedCorners: true,
    thickFrame: false,
    frame: false
  })

  newWindow.on('ready-to-show', () => {
    newWindow.show()
  })

  newWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  newWindow.webContents.on('will-attach-webview', (_event, webPreferences) => {
    webPreferences.preload = join(__dirname, '../preload/webview.js')
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    newWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return newWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Handle new window requests
  ipcMain.on('new-window', () => {
    createWindow()
  })

  ipcMain.on('set-transparency-mode', (_event, enabled: boolean) => {
    const senderWindow = BrowserWindow.fromWebContents(_event.sender)

    if (!senderWindow) {
      return
    }

    applyTransparencyMode(senderWindow, enabled)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
