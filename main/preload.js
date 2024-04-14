const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  navigate: (url) => ipcRenderer.send("navigate", url),
  navigateBack: () => ipcRenderer.send("navigate-back"),
  navigateForward: () => ipcRenderer.send("navigate-forward"),
  refresh: () => ipcRenderer.send("refresh"),
});
