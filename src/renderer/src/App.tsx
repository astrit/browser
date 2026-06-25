import { useEffect, useRef, useState } from 'react'
import './assets/styles.css'
import AddressBar from './components/address/address'
// import useWindowsDimensions from './hooks/useWindowsDimensions'
import Splash from './components/splash/splash'
import Bookmarks from './components/bookmarks/bookmarks'
import Settings from './components/settings/settings'
import Extensions from './components/extensions/extensions'

interface ViewPane {
  id: string
  url: string
}

function App(): JSX.Element {
  const [views, setViews] = useState<ViewPane[]>([{ id: 'view-1', url: '' }])
  const [focusedViewId, setFocusedViewId] = useState<string>('view-1')
  const [isFullyTransparent, setIsFullyTransparent] = useState(false)
  const [isMetaPressed, setIsMetaPressed] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showExtensions, setShowExtensions] = useState(false)
  const [showAddressBar, setShowAddressBar] = useState(true)
  const [closeToMenuBar, setCloseToMenuBar] = useState(false)
  const [menuBarVisible, setMenuBarVisible] = useState(true)
  const [preferencesReady, setPreferencesReady] = useState(false)
  // const windowDimensions = useWindowsDimensions()
  const webviewRefs = useRef<Record<string, HTMLWebViewElement | null>>({})

  const focusedIndex = Math.max(
    0,
    views.findIndex((view) => view.id === focusedViewId)
  )
  const focusedView = views[focusedIndex] ?? views[0]
  const activeUrl = focusedView?.url ?? ''
  const isAllViewsEmpty = views.every((view) => !view.url)

  useEffect(() => {
    window.api.getAppPreferences().then((preferences) => {
      setCloseToMenuBar(preferences.closeToMenuBar)
      setMenuBarVisible(preferences.menuBarVisible)
      setPreferencesReady(true)
    })

    const unsubscribe = window.api.onAppPreferences((preferences) => {
      setCloseToMenuBar(preferences.closeToMenuBar)
      setMenuBarVisible(preferences.menuBarVisible)
      setPreferencesReady(true)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!preferencesReady) {
      return
    }

    window.api.setCloseToMenuBar(closeToMenuBar)
  }, [closeToMenuBar, preferencesReady])

  useEffect(() => {
    if (!preferencesReady) {
      return
    }

    window.api.setMenuBarVisible(menuBarVisible)
  }, [menuBarVisible, preferencesReady])

  useEffect(() => {
    document.documentElement.classList.toggle('full-transparent', isFullyTransparent)
    document.body.classList.toggle('full-transparent', isFullyTransparent)
    window.api.setTransparencyMode(isFullyTransparent)

    return () => {
      document.documentElement.classList.remove('full-transparent')
      document.body.classList.remove('full-transparent')
      window.api.setTransparencyMode(false)
    }
  }, [isFullyTransparent])

  useEffect(() => {
    document.body.classList.toggle('meta-drag-active', isMetaPressed)

    return () => {
      document.body.classList.remove('meta-drag-active')
    }
  }, [isMetaPressed])

  useEffect(() => {
    const handleIpcMessage = (event: Event): void => {
      const { channel, args } = event as Event & { channel?: string; args?: unknown[] }

      if (channel === 'meta-key-state') {
        setIsMetaPressed(Boolean(args?.[0]))
      }

      if (channel === 'toggle-address-bar') {
        setShowAddressBar((prev) => !prev)
      }
    }

    const attachedWebviews = views
      .map((view) => webviewRefs.current[view.id])
      .filter((webview): webview is HTMLWebViewElement => Boolean(webview))

    attachedWebviews.forEach((webview) => {
      webview.addEventListener('ipc-message', handleIpcMessage)
    })

    return () => {
      attachedWebviews.forEach((webview) => {
        webview.removeEventListener('ipc-message', handleIpcMessage)
      })
    }
  }, [views])

  useEffect(() => {
    const unsubscribe = window.api.onOpenSettings(() => {
      setShowSettings(true)
      setShowBookmarks(false)
      setShowExtensions(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

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

      // Ctrl+T to toggle full transparency
      if (event.ctrlKey && event.key.toLowerCase() === 't') {
        event.preventDefault()
        setIsFullyTransparent((prev) => !prev)
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
    const webview = webviewRefs.current[focusedViewId] as unknown as { goBack: () => void }
    webview?.goBack?.()
  }

  const handleForward = (): void => {
    const webview = webviewRefs.current[focusedViewId] as unknown as { goForward: () => void }
    webview?.goForward?.()
  }

  const handleHome = (): void => {
    setViews((prevViews) =>
      prevViews.map((view) => {
        if (view.id !== focusedViewId) {
          return view
        }

        return {
          ...view,
          url: ''
        }
      })
    )
    setShowBookmarks(false)
    setShowSettings(false)
    setShowExtensions(false)
  }

  const handleBookmark = (): void => {
    setShowBookmarks(!showBookmarks)
    setShowSettings(false)
    setShowExtensions(false)
  }

  const handleExtensions = (): void => {
    setShowExtensions(!showExtensions)
    setShowBookmarks(false)
    setShowSettings(false)
  }

  const handleSettings = (): void => {
    setShowSettings(!showSettings)
    setShowBookmarks(false)
    setShowExtensions(false)
  }

  const handleOpenExtension = (action: string): void => {
    if (action === 'open-notes-window') {
      window.api.openNotesWindow()
    }
  }

  const handleNewWindow = (): void => {
    window.api.newWindow()
  }

  const handleTransparencyToggle = (): void => {
    setIsFullyTransparent((prev) => !prev)
  }

  const setFocusedUrl: React.Dispatch<React.SetStateAction<string>> = (nextUrl) => {
    setViews((prevViews) => {
      const currentFocusedUrl = prevViews.find((view) => view.id === focusedViewId)?.url ?? ''
      const resolvedUrl = typeof nextUrl === 'function' ? nextUrl(currentFocusedUrl) : nextUrl

      return prevViews.map((view) => {
        if (view.id !== focusedViewId) {
          return view
        }

        return {
          ...view,
          url: resolvedUrl
        }
      })
    })
  }

  const handleAddView = (side: 'left' | 'right'): void => {
    if (views.length > 1) {
      return
    }

    const newView: ViewPane = {
      id: `view-${Date.now()}`,
      url: ''
    }

    setViews((prevViews) => {
      if (side === 'left') {
        return [newView, ...prevViews]
      }

      return [...prevViews, newView]
    })
    setFocusedViewId(newView.id)
  }

  const focusAddressInput = (): void => {
    setShowAddressBar(true)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const input = document.getElementById('address-input') as HTMLInputElement | null
        input?.focus()
        input?.select()
      })
    })
  }

  const handleCloseView = (viewId: string): void => {
    if (views.length <= 1) {
      return
    }

    const closingIndex = views.findIndex((view) => view.id === viewId)

    if (closingIndex === -1) {
      return
    }

    const remainingViews = views.filter((view) => view.id !== viewId)

    if (!remainingViews.length) {
      return
    }

    setViews(remainingViews)

    if (focusedViewId === viewId) {
      const nextIndex = Math.min(closingIndex, remainingViews.length - 1)
      setFocusedViewId(remainingViews[nextIndex].id)
    }
  }

  return (
    <>
      {showAddressBar && (
        <AddressBar
          setUrl={setFocusedUrl}
          url={activeUrl}
          onBack={handleBack}
          onForward={handleForward}
          onHome={handleHome}
          onBookmark={handleBookmark}
          onExtensions={handleExtensions}
          onNewWindow={handleNewWindow}
          onSettings={handleSettings}
        />
      )}
      <main
        className={`content-frame${isAllViewsEmpty ? ' is-empty' : ''}${showBookmarks || showSettings || showExtensions ? ' show-side-panel' : ''}${!showAddressBar ? ' fullscreen' : ''}`}
      >
        <section className="webview-container">
          <div className={`webview-split${views.length > 1 ? ' is-multi' : ''}`}>
            {views.map((view) => {
              return (
                <div
                  key={view.id}
                  className="webview-pane"
                  onMouseDown={() => setFocusedViewId(view.id)}
                >
                  {view.url ? (
                    <>
                      <webview
                        className={isMetaPressed ? 'is-drag-ready' : ''}
                        ref={(element) => {
                          webviewRefs.current[view.id] = element
                        }}
                        src={`${view.url.includes('https://') ? '' : 'https://'}${view.url}`}
                        onFocus={() => setFocusedViewId(view.id)}
                        onMouseEnter={() => setFocusedViewId(view.id)}
                      />
                      <div
                        aria-hidden="true"
                        className={`drag-layer${isMetaPressed ? ' is-active' : ''}`}
                      />
                    </>
                  ) : (
                    <div
                      className={`splash-focus-area${isMetaPressed ? ' is-drag-ready' : ''}`}
                      onClick={() => {
                        setFocusedViewId(view.id)
                        focusAddressInput()
                      }}
                      onFocus={() => {
                        setFocusedViewId(view.id)
                        focusAddressInput()
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setFocusedViewId(view.id)
                          focusAddressInput()
                        }
                      }}
                      onMouseDown={() => setFocusedViewId(view.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <Splash />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {views.length === 1 && (
            <>
              <div className="view-insert-hotspot is-left">
                <button
                  className="view-insert-handle"
                  onClick={() => handleAddView('left')}
                  type="button"
                />
              </div>
              <div className="view-insert-hotspot is-right">
                <button
                  className="view-insert-handle"
                  onClick={() => handleAddView('right')}
                  type="button"
                />
              </div>
            </>
          )}

          {views.length > 1 && (
            <>
              <div className="view-close-hotspot is-left">
                <button
                  aria-label="Close left split"
                  className="view-close-handle"
                  onClick={() => handleCloseView(views[0].id)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="view-close-hotspot is-right">
                <button
                  aria-label="Close right split"
                  className="view-close-handle"
                  onClick={() => handleCloseView(views[views.length - 1].id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </section>
        {showBookmarks && <Bookmarks />}
        {showExtensions && <Extensions onOpenExtension={handleOpenExtension} />}
        {showSettings && (
          <Settings
            closeToMenuBar={closeToMenuBar}
            isFullyTransparent={isFullyTransparent}
            menuBarVisible={menuBarVisible}
            onCloseToMenuBarToggle={() => setCloseToMenuBar((prev) => !prev)}
            onMenuBarVisibleToggle={() => setMenuBarVisible((prev) => !prev)}
            onTransparencyToggle={handleTransparencyToggle}
          />
        )}
      </main>
    </>
  )
}

export default App
