import { useEffect, useRef, useState } from 'react'
import './assets/styles.css'
import AddressBar from './components/address/address'
// import useWindowsDimensions from './hooks/useWindowsDimensions'
import Splash from './components/splash/splash'

function App(): JSX.Element {
  const [url, setUrl] = useState<string>('')
  const [isMetaPressed, setIsMetaPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // const windowDimensions = useWindowsDimensions()
  const webviewRef = useRef<HTMLWebViewElement>(null)
  const loadingTimeoutRef = useRef<number | null>(null)

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

    const handleDidStopLoading = (): void => {
      setIsLoading(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }

    webview.addEventListener('ipc-message', handleIpcMessage)
    webview.addEventListener('did-stop-loading', handleDidStopLoading)

    return () => {
      webview.removeEventListener('ipc-message', handleIpcMessage)
      webview.removeEventListener('did-stop-loading', handleDidStopLoading)
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

  const handleKeystroke = (): void => {
    if (url) {
      setIsLoading(true)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false)
      }, 3000)
    }
  }

  return (
    <>
      <AddressBar setUrl={setUrl} url={url} onKeystroke={handleKeystroke} />
      <main className={`content-frame${!url ? ' is-empty' : ''}`}>
        {url ? (
          <>
            <webview
              className={isMetaPressed ? 'is-drag-ready' : ''}
              ref={webviewRef}
              src={`${url.includes('https://') ? '' : 'https://'}${url}`}
            />
            <div aria-hidden="true" className={`drag-layer${isMetaPressed ? ' is-active' : ''}`} />
          </>
        ) : (
          <Splash isLoading={isLoading} />
        )}
      </main>
    </>
  )
}

export default App
