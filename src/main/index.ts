// import { app, shell, ipcMain } from 'electron'
import { app, shell, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import { BrowserWindow } from 'electron-acrylic-window';
import icon from '../../512x512.png?asset'

let mainWindow: BrowserWindow | null = null
let menuBarTray: Tray | null = null
let clockTimer: NodeJS.Timeout | null = null
let isQuitting = false

const appPreferences = {
  closeToMenuBar: false,
  menuBarVisible: true
}

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

const getAppPreferences = (): { closeToMenuBar: boolean; menuBarVisible: boolean } => {
  return {
    closeToMenuBar: appPreferences.closeToMenuBar,
    menuBarVisible: appPreferences.menuBarVisible
  }
}

const broadcastAppPreferences = (): void => {
  BrowserWindow.getAllWindows().forEach((targetWindow) => {
    targetWindow.webContents.send('app-preferences', getAppPreferences())
  })
}

const focusMainWindow = (): void => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createWindow()
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  if (!mainWindow.isVisible()) {
    mainWindow.show()
  }

  mainWindow.focus()

  if (process.platform === 'darwin' && appPreferences.closeToMenuBar) {
    app.dock.show()
  }
}

const getClockLabel = (): string => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const createClockImage = (): Electron.NativeImage => {
  const size = 18
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect x="2" y="2" width="14" height="14" rx="7" fill="white"/>
    <rect x="6" y="6" width="6" height="6" rx="3" fill="black"/>
  </svg>`

  const image = nativeImage.createFromDataURL(
    `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  )

  image.setTemplateImage(false)

  return image
}

const updateTrayClock = (): void => {
  if (!menuBarTray) {
    return
  }

  menuBarTray.setTitle(getClockLabel())
}

const setApplicationMenu = (): void => {
  if (process.platform !== 'darwin') {
    return
  }

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          label: 'Settings',
          click: () => {
            focusMainWindow()
            mainWindow?.webContents.send('open-settings')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Show Menu Bar Item',
          type: 'checkbox',
          checked: appPreferences.menuBarVisible,
          click: (menuItem) => {
            setMenuBarVisible(Boolean(menuItem.checked))
          }
        },
        {
          label: 'Keep Running In Menu Bar',
          type: 'checkbox',
          checked: appPreferences.closeToMenuBar,
          click: (menuItem) => {
            setCloseToMenuBar(Boolean(menuItem.checked))
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            isQuitting = true
            app.quit()
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
}

const destroyMenuBarClock = (): void => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }

  if (menuBarTray) {
    menuBarTray.destroy()
    menuBarTray = null
  }
}

const setCloseToMenuBar = (enabled: boolean): void => {
  appPreferences.closeToMenuBar = enabled

  if (enabled) {
    appPreferences.menuBarVisible = true
    setMenuBarVisible(true)
    app.dock.hide()
  } else {
    app.dock.show()
  }

  setApplicationMenu()
  broadcastAppPreferences()
}

const setMenuBarVisible = (enabled: boolean): void => {
  appPreferences.menuBarVisible = enabled

  if (!enabled) {
    destroyMenuBarClock()
  } else {
    createMenuBarClock()
  }

  setApplicationMenu()
  broadcastAppPreferences()
}

const createMenuBarClock = (): void => {
  if (process.platform !== 'darwin') {
    return
  }

  if (menuBarTray || !appPreferences.menuBarVisible) {
    return
  }

  menuBarTray = new Tray(createClockImage())
  menuBarTray.setToolTip('Browser')
  menuBarTray.setTitle(getClockLabel())

  menuBarTray.on('click', () => {
    focusMainWindow()
  })

  menuBarTray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open Browser',
        click: () => {
          focusMainWindow()
        }
      },
      {
        label: 'Settings',
        click: () => {
          focusMainWindow()
          mainWindow?.webContents.send('open-settings')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Keep Running In Menu Bar',
        type: 'checkbox',
        checked: appPreferences.closeToMenuBar,
        click: (menuItem) => {
          setCloseToMenuBar(Boolean(menuItem.checked))
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true
          app.quit()
        }
      }
    ])
  )

  clockTimer = setInterval(updateTrayClock, 1000)
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
    newWindow.webContents.send('app-preferences', getAppPreferences())
  })

  newWindow.on('close', (event) => {
    if (process.platform === 'darwin' && appPreferences.closeToMenuBar && !isQuitting) {
      event.preventDefault()
      newWindow.hide()
      app.dock.hide()
    }
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

  mainWindow = newWindow

  newWindow.on('closed', () => {
    if (mainWindow === newWindow) {
      mainWindow = null
    }
  })

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

  ipcMain.on('set-close-to-menubar', (_event, enabled: boolean) => {
    setCloseToMenuBar(enabled)
  })

  ipcMain.on('set-menubar-visible', (_event, enabled: boolean) => {
    setMenuBarVisible(enabled)
  })

  ipcMain.handle('get-app-preferences', () => getAppPreferences())

  createWindow()
  createMenuBarClock()
  setApplicationMenu()

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

app.on('before-quit', () => {
  isQuitting = true
  destroyMenuBarClock()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
