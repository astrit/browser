import { useEffect, useMemo, useState } from 'react'
import './assets/notes.css'

interface NoteItem {
  id: string
  title: string
  body: string
}

const createId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createNote = (index: number): NoteItem => {
  return {
    id: createId(),
    title: `Note ${index}`,
    body: ''
  }
}

function NotesApp(): JSX.Element {
  const [notes, setNotes] = useState<NoteItem[]>([createNote(1)])
  const [activeId, setActiveId] = useState<string>(notes[0].id)
  const [isMetaPressed, setIsMetaPressed] = useState(false)

  const activeIndex = useMemo(() => {
    const index = notes.findIndex((note) => note.id === activeId)
    return index < 0 ? 0 : index
  }, [notes, activeId])

  const activeNote = notes[activeIndex]

  const updateActiveNote = (patch: Partial<NoteItem>): void => {
    setNotes((prevNotes) => {
      return prevNotes.map((note, index) => {
        if (index !== activeIndex) {
          return note
        }

        return {
          ...note,
          ...patch
        }
      })
    })
  }

  const handleAddNote = (): void => {
    const nextNote = createNote(notes.length + 1)
    setNotes((prevNotes) => [...prevNotes, nextNote])
    setActiveId(nextNote.id)
  }

  const handleCloseWindow = (): void => {
    window.close()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement> = (
    event
  ) => {
    if (event.key === 'Meta' || event.metaKey) {
      setIsMetaPressed(true)
    }
  }

  const handleKeyUp: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement> = (
    event
  ) => {
    if (event.key === 'Meta' || !event.metaKey) {
      setIsMetaPressed(false)
    }
  }

  const handleWindowBlur = (): void => {
    setIsMetaPressed(false)
  }

  const handleWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Meta') {
      setIsMetaPressed(true)
    }
  }

  const handleWindowKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Meta') {
      setIsMetaPressed(false)
    }
  }

  const handleVisibilityChange = (): void => {
    if (document.hidden) {
      setIsMetaPressed(false)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleWindowKeyDown)
    window.addEventListener('keyup', handleWindowKeyUp)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown)
      window.removeEventListener('keyup', handleWindowKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <main className={`notes-root${isMetaPressed ? ' is-drag-ready' : ''}`}>
      <header className="notes-header">
        <input
          className="notes-title-input"
          onChange={(event) => updateActiveNote({ title: event.target.value })}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder="Untitled"
          value={activeNote?.title ?? ''}
        />
        <button className="notes-close" onClick={handleCloseWindow} type="button">
          ×
        </button>
      </header>

      <div className="notes-tab-bar">
        {notes.map((note) => (
          <button
            key={note.id}
            className={`notes-tab${note.id === activeId ? ' is-active' : ''}`}
            onClick={() => setActiveId(note.id)}
            type="button"
          >
            {note.title || 'Untitled'}
          </button>
        ))}
        <button className="notes-add" onClick={handleAddNote} type="button">
          +
        </button>
      </div>

      <textarea
        className="notes-editor"
        onChange={(event) => updateActiveNote({ body: event.target.value })}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Write notes..."
        value={activeNote?.body ?? ''}
      />
    </main>
  )
}

export default NotesApp
