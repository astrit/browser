const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  navigate: (url) => ipcRenderer.send("navigate", url),
  navigateBack: () => ipcRenderer.send("navigate-back"),
  navigateForward: () => ipcRenderer.send("navigate-forward"),
  refresh: () => ipcRenderer.send("refresh"),
});

// const { ipcRenderer } = require('electron');

document.getElementById("reloadBtn").addEventListener("click", () => {
  ipcRenderer.send("reload");
});

document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("go-back");
});

document.getElementById("forwardBtn").addEventListener("click", () => {
  ipcRenderer.send("go-forward");
});

document.getElementById("goBtn").addEventListener("click", () => {
  const url = document.getElementById("addressInput").value;
  ipcRenderer.send("navigate", url);
});
