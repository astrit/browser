import { useEffect, useRef, useState } from 'react'
import './assets/styles.css'
import AddressBar from './components/address/address'
// import useWindowsDimensions from './hooks/useWindowsDimensions'
import Splash from './components/splash/splash'

function App(): JSX.Element {
  const [url, setUrl] = useState<string>('')
  const [isMetaPressed, setIsMetaPressed] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  // const windowDimensions = useWindowsDimensions()
  const webviewRef = useRef<HTMLWebViewElement>(null)

  useEffect(() => {
    const webview = webviewRef.current

    if (!webview) {
      return
    }

    const handleIpcMessage = (event: Event): void => {
      const { channel, args } = event as Event & { channel?: string; args?: unknown[] }

      if (channel === 'meta-key-state') {
        setIsMetaPressed(Boolean(args?.[0]))
      }
    }

    webview.addEventListener('ipc-message', handleIpcMessage)

    return () => {
      webview.removeEventListener('ipc-message', handleIpcMessage)
    }
  }, [url])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Meta') {
        setIsMetaPressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'Meta') {
        setIsMetaPressed(false)
      }
    }

    const handleWindowBlur = (): void => {
      setIsMetaPressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [])

  const handleBack = (): void => {
    const webview = webviewRef.current as unknown as { goBack: () => void }
    webview?.goBack?.()
  }

  const handleForward = (): void => {
    const webview = webviewRef.current as unknown as { goForward: () => void }
    webview?.goForward?.()
  }

  const handleHome = (): void => {
    setUrl('')
    setShowBookmarks(false)
  }

  const handleBookmark = (): void => {
    setShowBookmarks(!showBookmarks)
  }

  const handleNewWindow = (): void => {
    window.api.newWindow()
  }

  return (
    <>
      <AddressBar
        setUrl={setUrl}
        url={url}
        onBack={handleBack}
        onForward={handleForward}
        onHome={handleHome}
        onBookmark={handleBookmark}
        onNewWindow={handleNewWindow}
      />
      <main
        className={`content-frame${!url ? ' is-empty' : ''}${showBookmarks ? ' show-bookmarks' : ''}`}
      >
        <div className="webview-container">
          {url ? (
            <>
              <webview
                className={isMetaPressed ? 'is-drag-ready' : ''}
                ref={webviewRef}
                src={`${url.includes('https://') ? '' : 'https://'}${url}`}
              />
              <div
                aria-hidden="true"
                className={`drag-layer${isMetaPressed ? ' is-active' : ''}`}
              />
            </>
          ) : (
            <Splash />
          )}
        </div>
        {showBookmarks && (
          <aside className="bookmarks-panel">
            <div className="bookmarks-header">Bookmarks</div>
            <div className="bookmarks-list">{/* Bookmarks will be added here */}</div>
          </aside>
        )}
      </main>
    </>
  )
}

export default App
