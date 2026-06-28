import { useEffect, useMemo, useState } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import './notes.css'

interface NoteItem {
  id: string
  title: string
  body: string
  language: string
  isPreview: boolean
}

const noteLanguages = [
  'markdown',
  'plaintext',
  'javascript',
  'typescript',
  'html',
  'css',
  'json'
] as const

;(globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment = {
  getWorker(_: string, label: string): Worker {
    if (label === 'json') {
      return new jsonWorker()
    }

    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }

    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }

    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }

    return new editorWorker()
  }
}

loader.config({ monaco })

const createId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createNote = (index: number): NoteItem => {
  return {
    id: createId(),
    title: `Note ${index}`,
    body: '',
    language: 'markdown',
    isPreview: false
  }
}

function Notes(): JSX.Element {
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
          placeholder="Untitled"
          value={activeNote?.title ?? ''}
        />
        <button className="notes-close" onClick={handleCloseWindow} type="button">
          x
        </button>
      </header>

      <div className="notes-controls">
        <select
          className="notes-language-select"
          onChange={(event) => updateActiveNote({ language: event.target.value, isPreview: false })}
          value={activeNote?.language ?? 'markdown'}
        >
          {noteLanguages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
        <button
          className={`notes-preview-toggle${activeNote?.isPreview ? ' is-active' : ''}`}
          onClick={() => updateActiveNote({ isPreview: !activeNote?.isPreview })}
          type="button"
        >
          {activeNote?.isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

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

      {activeNote?.isPreview && activeNote.language === 'markdown' ? (
        <section className="notes-preview markdown-preview">
          <ReactMarkdown>{activeNote.body || '_Nothing to preview_'}</ReactMarkdown>
        </section>
      ) : (
        <section
          className={`notes-editor-wrap${activeNote?.isPreview ? ' is-preview-locked' : ''}`}
        >
          <Editor
            defaultLanguage="markdown"
            height="100%"
            language={activeNote?.language ?? 'markdown'}
            loading={<div className="notes-editor-loading">Loading editor...</div>}
            onChange={(value) => {
              updateActiveNote({ body: value ?? '' })
            }}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              lineNumbers: 'off',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              overviewRulerLanes: 0,
              scrollBeyondLastLine: false,
              renderLineHighlight: 'none',
              hideCursorInOverviewRuler: true,
              readOnly: Boolean(activeNote?.isPreview && activeNote?.language !== 'markdown'),
              wordWrap: 'on',
              fontSize: 12,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              padding: { top: 10, bottom: 10 },
              scrollbar: {
                vertical: 'auto',
                horizontal: 'hidden'
              }
            }}
            theme="vs-dark"
            value={activeNote?.body ?? ''}
            width="100%"
          />
          {activeNote?.isPreview && activeNote?.language !== 'markdown' && (
            <div className="notes-preview-lock">Preview mode is read-only for this language.</div>
          )}
        </section>
      )}

      <div className={`notes-drag-layer${isMetaPressed ? ' is-active' : ''}`} />
    </main>
  )
}

export default Notes
