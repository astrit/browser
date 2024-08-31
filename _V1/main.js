const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");

let mainWindow;
let view;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  view = new BrowserView();
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 60, width: 800, height: 540 });
  view.webContents.loadURL("http://google.com");

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.on("navigate", (event, url) => {
  view.webContents.loadURL(url);
});
