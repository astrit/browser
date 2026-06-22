import { useEffect, useRef, useState } from 'react'
import './assets/styles.css'
import AddressBar from './components/address/address'
// import useWindowsDimensions from './hooks/useWindowsDimensions'
import Splash from './components/splash/splash'
import Bookmarks from './components/bookmarks/bookmarks'
import Settings from './components/settings/settings'

function App(): JSX.Element {
  const [url, setUrl] = useState<string>('')
  const [isMetaPressed, setIsMetaPressed] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddressBar, setShowAddressBar] = useState(true)
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

      // Cmd+L to toggle address bar
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault()
        setShowAddressBar((prev) => !prev)
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
    setShowSettings(false)
  }

  const handleBookmark = (): void => {
    setShowBookmarks(!showBookmarks)
    setShowSettings(false)
  }

  const handleSettings = (): void => {
    setShowSettings(!showSettings)
    setShowBookmarks(false)
  }

  const handleNewWindow = (): void => {
    window.api.newWindow()
  }

  return (
    <>
      {showAddressBar && (
        <AddressBar
          setUrl={setUrl}
          url={url}
          onBack={handleBack}
          onForward={handleForward}
          onHome={handleHome}
          onBookmark={handleBookmark}
          onNewWindow={handleNewWindow}
          onSettings={handleSettings}
        />
      )}
      <main
        className={`content-frame${!url ? ' is-empty' : ''}${showBookmarks || showSettings ? ' show-side-panel' : ''}${!showAddressBar ? ' fullscreen' : ''}`}
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
        {showBookmarks && <Bookmarks />}
        {showSettings && <Settings />}
      </main>
    </>
  )
}

export default App
