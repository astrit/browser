const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");

let mainWindow;
let view;
let activeView; // Declare activeView here

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
  view.setBounds({ x: 0, y: 10, width: 800, height: 540 });
  view.webContents.loadURL("http://google.com");

  let indexView = new BrowserView();
  mainWindow.addBrowserView(indexView);
  indexView.setBounds({ x: 0, y: 0, width: 800, height: 600 });
  indexView.webContents.loadFile("index.html");

  activeView = view; // Set activeView here, after view is initialized
}

app.whenReady().then(createWindow);

ipcMain.on("navigate", (event, url) => {
  activeView.webContents.loadURL(url);
});
