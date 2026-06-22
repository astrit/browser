import { ipcRenderer } from 'electron'

const sendMetaKeyState = (isPressed: boolean): void => {
  ipcRenderer.sendToHost('meta-key-state', isPressed)
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Meta' || event.metaKey) {
    sendMetaKeyState(true)
  }

  // Send Cmd+L to host renderer to toggle address bar
  if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
    event.preventDefault()
    ipcRenderer.sendToHost('toggle-address-bar')
  }
})

window.addEventListener('keyup', (event) => {
  if (event.key === 'Meta' || !event.metaKey) {
    sendMetaKeyState(false)
  }
})

window.addEventListener('blur', () => {
  sendMetaKeyState(false)
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    sendMetaKeyState(false)
  }
})
