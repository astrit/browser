import React from 'react'
import './bookmarks.css'

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  favicon?: string
  folder?: string
}

const dummyBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'GitHub',
    url: 'github.com',
    description: 'Where the world builds software',
    favicon: 'https://github.com/favicon.ico',
    folder: 'Development'
  },
  {
    id: '2',
    title: 'React Docs',
    url: 'react.dev',
    description: 'The library for web and native user interfaces',
    favicon: 'https://react.dev/favicon.ico',
    folder: 'Development'
  },
  {
    id: '3',
    title: 'MDN Web Docs',
    url: 'mdn.org',
    description: 'Resources for developers, by developers',
    favicon: 'https://mdn.org/favicon.ico',
    folder: 'Reference'
  },
  {
    id: '4',
    title: 'YouTube',
    url: 'youtube.com',
    description: 'Watch, upload and share videos',
    favicon: 'https://youtube.com/favicon.ico',
    folder: 'Entertainment'
  }
]

const Bookmarks: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set(['Development', 'Reference', 'Entertainment'])
  )

  const toggleFolder = (folder: string): void => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder)
    } else {
      newExpanded.add(folder)
    }
    setExpandedFolders(newExpanded)
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredBookmarks = dummyBookmarks.filter((bookmark) => {
    if (!normalizedSearch) {
      return true
    }

    const haystack = [bookmark.title, bookmark.url, bookmark.description ?? '', bookmark.folder ?? '']
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedSearch)
  })

  const groupedBookmarks = filteredBookmarks.reduce(
    (acc, bookmark) => {
      const folder = bookmark.folder || 'Uncategorized'
      if (!acc[folder]) {
        acc[folder] = []
      }
      acc[folder].push(bookmark)
      return acc
    },
    {} as Record<string, Bookmark[]>
  )

  return (
    <aside className="bookmarks-panel">
      <div className="panel-header">Bookmarks</div>
      <div className="bookmark-search-wrap">
        <input
          className="bookmark-search-input"
          type="text"
          placeholder="Search bookmarks"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      <div className="panel-content">
        {Object.entries(groupedBookmarks).length === 0 && (
          <div className="bookmark-empty-state">No bookmarks match your search.</div>
        )}
        {Object.entries(groupedBookmarks).map(([folder, bookmarks]) => (
          <div key={folder} className="bookmark-folder">
            <button className="folder-toggle" onClick={() => toggleFolder(folder)}>
              <svg
                className={`folder-icon${expandedFolders.has(folder) ? ' expanded' : ''}`}
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              <span>{folder}</span>
              <span className="bookmark-count">({bookmarks.length})</span>
            </button>

            {expandedFolders.has(folder) && (
              <div className="bookmarks-in-folder">
                {bookmarks.map((bookmark) => (
                  <a
                    key={bookmark.id}
                    href={bookmark.url}
                    className="bookmark-item"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=16`}
                      alt={bookmark.title}
                      className="bookmark-favicon"
                    />
                    <div className="bookmark-details">
                      <div className="bookmark-title">{bookmark.title}</div>
                      {bookmark.description && (
                        <div className="bookmark-description">{bookmark.description}</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Bookmarks
