import { useMemo, useState } from 'react'
import './cmd.css'

type CmdAppItem = {
  id: string
  name: string
  description: string
}

const cmdApps: CmdAppItem[] = [
  {
    id: 'notes',
    name: 'notes',
    description: 'notes'
  },
  {
    id: 'cmd',
    name: 'cmd',
    description: 'cmd'
  }
]

function cmd(): JSX.Element {
  const [query, setQuery] = useState('')

  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return cmdApps
    }

    return cmdApps.filter((app) => {
      return [app.name, app.description].join(' ').toLowerCase().includes(normalizedQuery)
    })
  }, [query])

  const openApp = (id: string): void => {
    if (id === 'notes') {
      window.api.openNotesWindow()
      return
    }

    if (id === 'cmd') {
      window.api.openCmdWindow()
    }
  }

  const handleCloseWindow = (): void => {
    window.close()
  }

  return (
    <main className="cmd-root">
      <section className="cmd-panel">
        <header className="cmd-header">
          <span className="cmd-search-prefix">&gt;</span>
          <input
            className="cmd-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search apps"
            value={query}
          />
          <button className="cmd-close" onClick={handleCloseWindow} type="button">
            x
          </button>
        </header>

        <div className="cmd-section-label">apps</div>

        <section className="cmd-list">
          {filteredApps.length === 0 && <div className="cmd-empty">No apps found.</div>}
          {filteredApps.map((app) => (
            <button key={app.id} className="cmd-item" onClick={() => openApp(app.id)} type="button">
              <div className="cmd-item-content">
                <div className="cmd-item-name">{app.name}</div>
                <div className="cmd-item-description">{app.description}</div>
              </div>
              <span className="cmd-item-hint">Enter</span>
            </button>
          ))}
        </section>
      </section>
    </main>
  )
}

export default cmd
