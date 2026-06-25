import React from 'react'
import './extensions.css'
import { extensionApps } from '../../extensions/registry'

interface ExtensionsProps {
  onOpenExtension: (action: string) => void
}

const Extensions: React.FC<ExtensionsProps> = ({ onOpenExtension }) => {
  const [searchQuery, setSearchQuery] = React.useState('')

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredExtensions = extensionApps.filter((extension) => {
    if (!normalizedSearch) {
      return true
    }

    return [extension.name, extension.description]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch)
  })

  return (
    <aside className="extensions-panel">
      <div className="panel-header">Extensions</div>
      <div className="extensions-search-wrap">
        <input
          className="extensions-search-input"
          type="text"
          placeholder="Search extensions"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      <div className="panel-content">
        {filteredExtensions.length === 0 && (
          <div className="extensions-empty-state">No extensions match your search.</div>
        )}
        {filteredExtensions.map((extension) => (
          <button
            key={extension.id}
            className="extension-item"
            onClick={() => onOpenExtension(extension.action)}
            type="button"
          >
            <div className="extension-name">{extension.name}</div>
            <div className="extension-description">{extension.description}</div>
          </button>
        ))}
      </div>
    </aside>
  )
}

export default Extensions
