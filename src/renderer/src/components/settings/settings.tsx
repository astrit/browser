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
  },
  {
    id: '8',
    name: 'Close / Go Home',
    description: 'Go to splash if on a page; close window if already on splash',
    keys: 'Cmd+Q'
  },
  {
    id: '9',
    name: 'Open DevTools',
    description: 'Open the developer tools inspector',
    keys: 'Cmd+J'
  },
  {
    id: '10',
    name: 'Close DevTools',
    description: 'Close the developer tools inspector',
    keys: 'Cmd+Shift+J'
  },
  {
    id: '11',
    name: 'Open cmd',
    description: 'Open the cmd app window',
    keys: 'Cmd+K'
  }
]

const Settings: React.FC<{
  closeToMenuBar: boolean
  devToolsOpen: boolean
  isFullyTransparent: boolean
  menuBarVisible: boolean
  onCloseToMenuBarToggle: () => void
  onCloseDevTools: () => void
  onMenuBarVisibleToggle: () => void
  onOpenDevTools: () => void
  onTransparencyToggle: () => void
}> = ({
  closeToMenuBar,
  devToolsOpen,
  isFullyTransparent,
  menuBarVisible,
  onCloseToMenuBarToggle,
  onCloseDevTools,
  onMenuBarVisibleToggle,
  onOpenDevTools,
  onTransparencyToggle
}) => {
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
    <aside
      className="settings-panel"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement
        if (!target.closest('.settings-search-wrap')) {
          const input = (e.currentTarget as HTMLElement).querySelector(
            '.settings-search-input'
          ) as HTMLInputElement | null
          input?.blur()
        }
      }}
    >
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

        <div className="settings-section">
          <h3 className="section-title">Menu Bar</h3>
          <Toggle
            checked={menuBarVisible}
            label="Show Menu Bar Item"
            onChange={onMenuBarVisibleToggle}
          />
          <p className="settings-helper-text">Show or hide this app in the macOS menu bar.</p>
          <Toggle
            checked={closeToMenuBar}
            label="Keep Running In Menu Bar"
            onChange={onCloseToMenuBarToggle}
          />
          <p className="settings-helper-text">
            Closing the window hides it to the menu bar and keeps the app alive. Quit from the menu
            bar menu to exit fully.
          </p>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Developer</h3>
          <Toggle
            checked={devToolsOpen}
            label="Developer Tools"
            onChange={devToolsOpen ? onCloseDevTools : onOpenDevTools}
          />
          <p className="settings-helper-text">
            Open or close DevTools. Also: Cmd+J to open, Cmd+Shift+J to close.
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
