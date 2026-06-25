import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import NotesApp from './NotesApp'

const params = new URLSearchParams(window.location.search)
const RootComponent = params.get('view') === 'notes' ? NotesApp : App

ReactDOM.createRoot(document.getElementById('core') as HTMLElement).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
)
