import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { getExtensionWindowView } from './extensions/registry'

const params = new URLSearchParams(window.location.search)
const RootComponent = getExtensionWindowView(params.get('view')) ?? App

ReactDOM.createRoot(document.getElementById('core') as HTMLElement).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
)
