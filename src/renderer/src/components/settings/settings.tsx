import React from 'react'
import './settings.css'
import Toggle from '../toggle/toggle'

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
  },
  {
    id: '7',
    name: 'Toggle Transparency',
    description: 'Enable or disable fully transparent browser mode',
    keys: 'Ctrl+T'
  }
]

const Settings: React.FC<{
  isFullyTransparent: boolean
  onTransparencyToggle: () => void
}> = ({ isFullyTransparent, onTransparencyToggle }) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredShortcuts = dummyShortcuts.filter((shortcut) => {
    if (!normalizedSearch) {
      return true
    }

    return [shortcut.name, shortcut.description, shortcut.keys]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch)
  })

  const aboutItems = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Electron', value: '28.2.0' }
  ]

  const filteredAboutItems = aboutItems.filter((item) => {
    if (!normalizedSearch) {
      return true
    }

    return `${item.label} ${item.value}`.toLowerCase().includes(normalizedSearch)
  })

  return (
    <aside className="settings-panel">
      <div className="panel-header">Settings</div>
      <div className="settings-search-wrap">
        <input
          className="settings-search-input"
          type="text"
          placeholder="Search settings"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      <div className="panel-content">
        <div className="settings-section">
          <h3 className="section-title">Appearance</h3>
          <Toggle
            checked={isFullyTransparent}
            label="Full Transparency"
            onChange={onTransparencyToggle}
          />
          <p className="settings-helper-text">
            This mode removes frosted glass effects and panel fills for a fully clear browser
            chrome.
          </p>
        </div>

        {filteredShortcuts.length > 0 && (
          <div className="settings-section">
            <h3 className="section-title">Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              {filteredShortcuts.map((shortcut) => (
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
        )}

        {filteredAboutItems.length > 0 && (
          <div className="settings-section">
            <h3 className="section-title">About</h3>
            <div className="about-info">
              {filteredAboutItems.map((item) => (
                <div className="info-row" key={item.label}>
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredShortcuts.length === 0 && filteredAboutItems.length === 0 && (
          <div className="settings-empty-state">No settings match your search.</div>
        )}
      </div>
    </aside>
  )
}

export default Settings
