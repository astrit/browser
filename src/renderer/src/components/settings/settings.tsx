import React from 'react'
import './settings.css'

interface Shortcut {
  id: string
  name: string
  description: string
  keys: string
}

const dummyShortcuts: Shortcut[] = [
  {
    id: '1',
    name: 'Back',
    description: 'Go to previous page',
    keys: '← or Cmd+['
  },
  {
    id: '2',
    name: 'Forward',
    description: 'Go to next page',
    keys: '→ or Cmd+]'
  },
  {
    id: '3',
    name: 'Home',
    description: 'Go to home/splash',
    keys: 'Cmd+H'
  },
  {
    id: '4',
    name: 'Toggle Bookmarks',
    description: 'Show/hide bookmarks panel',
    keys: 'Cmd+B'
  },
  {
    id: '5',
    name: 'Toggle Settings',
    description: 'Show/hide settings panel',
    keys: 'Cmd+,'
  },
  {
    id: '6',
    name: 'New Window',
    description: 'Open a new browser window',
    keys: 'Cmd+N'
  }
]

const Settings: React.FC = () => {
  const [editingId, setEditingId] = React.useState<string | null>(null)

  return (
    <aside className="settings-panel">
      <div className="panel-header">Settings</div>
      <div className="panel-content">
        <div className="settings-section">
          <h3 className="section-title">Keyboard Shortcuts</h3>
          <div className="shortcuts-list">
            {dummyShortcuts.map((shortcut) => (
              <div
                key={shortcut.id}
                className={`shortcut-item${editingId === shortcut.id ? ' editing' : ''}`}
                onDoubleClick={() => setEditingId(shortcut.id)}
              >
                <div className="shortcut-info">
                  <div className="shortcut-name">{shortcut.name}</div>
                  <div className="shortcut-description">{shortcut.description}</div>
                </div>
                <div className="shortcut-keys">{shortcut.keys}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">About</h3>
          <div className="about-info">
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Electron</span>
              <span className="info-value">28.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Settings
