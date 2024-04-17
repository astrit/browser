const BrowserView = electron.BrowserView

var viewMap = {} // id: view
var viewStateMap = {} // id: view state

var temporaryPopupViews = {} // id: view

// rate limit on "open in app" requests
var globalLaunchRequests = 0

function getDefaultViewWebPreferences () {
  return (
    {
      nodeIntegration: false,
      nodeIntegrationInSubFrames: true,
      scrollBounce: true,
      safeDialogs: true,
      safeDialogsMessage: 'Prevent this page from creating additional dialogs',
      preload: __dirname + '/dist/preload.js',
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false,
      allowPopups: false,
      // partition: partition || 'persist:webcontent',
      enableWebSQL: false,
      autoplayPolicy: (settings.get('enableAutoplay') ? 'no-user-gesture-required' : 'user-gesture-required'),
      // match Chrome's default for anti-fingerprinting purposes (Electron defaults to 0)
      minimumFontSize: 6,
      javascript: !(settings.get('filtering')?.contentTypes?.includes('script'))
    }
  )
}

function createView (existingViewId, id, webPreferences, boundsString, events) {
  if (viewStateMap[id]) {
    console.warn("Creating duplicate view")
  }

  const viewPrefs = Object.assign({}, getDefaultViewWebPreferences(), webPreferences)

  viewStateMap[id] = {
    loadedInitialURL: false,
    hasJS: viewPrefs.javascript // need this later to see if we should swap the view for a JS-enabled one
  }

  let view
  if (existingViewId) {
    view = temporaryPopupViews[existingViewId]
    delete temporaryPopupViews[existingViewId]

    // the initial URL has already been loaded, so set the background color
    view.setBackgroundColor('#fff')
    viewStateMap[id].loadedInitialURL = true
  } else {
    view = new BrowserView({ webPreferences: viewPrefs })
  }

  events.forEach(function (event) {
    view.webContents.on(event, function (e) {
      var args = Array.prototype.slice.call(arguments).slice(1)

      const eventTarget = BrowserWindow.fromBrowserView(view) || windows.getCurrent()

      if (!eventTarget) {
        //this can happen during shutdown - windows can be destroyed before the corresponding views, and the view can emit an event during that time
        return
      }

      eventTarget.webContents.send('view-event', {
        tabId: id,
        event: event,
        args: args
      })
    })
  })

  view.webContents.on('select-bluetooth-device', function (event, deviceList, callback) {
    event.preventDefault()
    callback('')
  })

  view.webContents.setWindowOpenHandler(function (details) {
    /*
      Opening a popup with window.open() generally requires features to be set
      So if there are no features, the event is most likely from clicking on a link, which should open a new tab.
      Clicking a link can still have a "new-window" or "foreground-tab" disposition depending on which keys are pressed
      when it is clicked.
      (https://github.com/minbrowser/min/issues/1835)
    */
    if (!details.features) {
      const eventTarget = BrowserWindow.fromBrowserView(view) || windows.getCurrent()

      eventTarget.webContents.send('view-event', {
        tabId: id,
        event: 'new-tab',
        args: [details.url, !(details.disposition === 'background-tab')]
      })
      return {
        action: 'deny'
      }
    }

    return {
      action: 'allow'
    }
  })

  view.webContents.removeAllListeners('-add-new-contents')

  view.webContents.on('-add-new-contents', function (e, webContents, disposition, _userGesture, _left, _top, _width, _height, url, frameName, referrer, rawFeatures, postData) {
    if (!filterPopups(url)) {
      return
    }

    var view = new BrowserView({ webPreferences: getDefaultViewWebPreferences(), webContents: webContents })

    var popupId = Math.random().toString()
    temporaryPopupViews[popupId] = view

    const eventTarget = BrowserWindow.fromBrowserView(view) || windows.getCurrent()

    eventTarget.webContents.send('view-event', {
      tabId: id,
      event: 'did-create-popup',
      args: [popupId, url]
    })
  })

  view.webContents.on('ipc-message', function (e, channel, data) {
    var senderURL
    try {
      senderURL = e.senderFrame.url
    } catch (err) {
      // https://github.com/minbrowser/min/issues/2052
      console.warn('dropping message because senderFrame is destroyed', channel, data, err)
      return
    }

    const eventTarget = BrowserWindow.fromBrowserView(view) || windows.getCurrent()

    if (!eventTarget) {
      //this can happen during shutdown - windows can be destroyed before the corresponding views, and the view can emit an event during that time
      return
    }

    eventTarget.webContents.send('view-ipc', {
      id: id,
      name: channel,
      data: data,
      frameId: e.frameId,
      frameURL: senderURL
    })
  })

  // Open a login prompt when site asks for http authentication
  view.webContents.on('login', (event, authenticationResponseDetails, authInfo, callback) => {
    if (authInfo.scheme !== 'basic') { // Only for basic auth
      return
    }
    event.preventDefault()
    var title = l('loginPromptTitle').replace('%h', authInfo.host)
    createPrompt({
      text: title,
      values: [{ placeholder: l('username'), id: 'username', type: 'text' },
        { placeholder: l('password'), id: 'password', type: 'password' }],
      ok: l('dialogConfirmButton'),
      cancel: l('dialogSkipButton'),
      width: 400,
      height: 200
    }, function (result) {
      // resend request with auth credentials
      callback(result.username, result.password)
    })
  })

  // show an "open in app" prompt for external protocols

  function handleExternalProtocol (e, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) {
    var knownProtocols = ['http', 'https', 'file', 'min', 'about', 'data', 'javascript', 'chrome'] // TODO anything else?
    if (!knownProtocols.includes(url.split(':')[0])) {
      var externalApp = app.getApplicationNameForProtocol(url)
      if (externalApp) {
        var sanitizedName = externalApp.replace(/[^a-zA-Z0-9.]/g, '')
        if (globalLaunchRequests < 2) {
          globalLaunchRequests++
          setTimeout(function () {
            globalLaunchRequests--
          }, 20000)
          var result = electron.dialog.showMessageBoxSync({
            type: 'question',
            buttons: ['OK', 'Cancel'],
            message: l('openExternalApp').replace('%s', sanitizedName).replace(/\\/g, ''),
            detail: url.length > 160 ? url.substring(0, 160) + '...' : url
          })

          if (result === 0) {
            electron.shell.openExternal(url)
          }
        }
      }
    }
  }

  view.webContents.on('did-start-navigation', handleExternalProtocol)
  /*
  It's possible for an HTTP request to redirect to an external app link
  (primary use case for this is OAuth from desktop app > browser > back to app)
  and did-start-navigation isn't (always?) emitted for redirects, so we need this handler as well
  */
  view.webContents.on('will-redirect', handleExternalProtocol)

  /*
  the JS setting can only be set when the view is created, so swap the view on navigation if the setting value changed
  This can occur if the user manually changed the setting, or if we are navigating between an internal page (always gets JS)
  and an external one
  */
  view.webContents.on('did-start-navigation', function (event) {
    if (event.isMainFrame && !event.isSameDocument) {
      const hasJS = viewStateMap[id].hasJS
      const shouldHaveJS = (!(settings.get('filtering')?.contentTypes?.includes('script'))) || event.url.startsWith('min://')
      if (hasJS !== shouldHaveJS) {
        setTimeout(function () {
          view.webContents.stop()
          const currentWindow = BrowserWindow.fromBrowserView(view)
          destroyView(id)
          const newView = createView(existingViewId, id, Object.assign({}, webPreferences, { javascript: shouldHaveJS }), boundsString, events)
          loadURLInView(id, event.url, currentWindow)

          if (currentWindow) {
            setView(id, currentWindow.webContents)
            focusView(id)
          }
        }, 0)
      }
    }
  })

  view.setBounds(JSON.parse(boundsString))

  viewMap[id] = view

  return view
}

function destroyView (id) {
  if (!viewMap[id]) {
    return
  }

  windows.getAll().forEach(function (window) {
    if (viewMap[id] === window.getBrowserView()) {
      window.setBrowserView(null)
      // TODO fix
      windows.getState(window).selectedView = null
    }
  })
  viewMap[id].webContents.destroy()

  delete viewMap[id]
  delete viewStateMap[id]
}

function destroyAllViews () {
  for (const id in viewMap) {
    destroyView(id)
  }
}

function setView (id, senderContents) {
  const win = windows.windowFromContents(senderContents).win

  // setBrowserView causes flickering, so we only want to call it if the view is actually changing
  // see https://github.com/minbrowser/min/issues/1966
  if (win.getBrowserView() !== viewMap[id]) {
    if (viewStateMap[id].loadedInitialURL) {
      win.setBrowserView(viewMap[id])
    } else {
      win.setBrowserView(null)
    }
    windows.getState(win).selectedView = id
  }
}

function setBounds (id, bounds) {
  if (viewMap[id]) {
    viewMap[id].setBounds(bounds)
  }
}

function focusView (id) {
  // empty views can't be focused because they won't propogate keyboard events correctly, see https://github.com/minbrowser/min/issues/616
  // also, make sure the view exists, since it might not if the app is shutting down
  if (viewMap[id] && (viewMap[id].webContents.getURL() !== '' || viewMap[id].webContents.isLoading())) {
    viewMap[id].webContents.focus()
    return true
  } else if (BrowserWindow.fromBrowserView(viewMap[id])) {
    BrowserWindow.fromBrowserView(viewMap[id]).webContents.focus()
    return true
  }
}

function hideCurrentView (senderContents) {
  const win = windows.windowFromContents(senderContents).win

  win.setBrowserView(null)
  windows.getState(win).selectedView = null
  if (win.isFocused()) {
    win.webContents.focus()
  }
}

function getView (id) {
  return viewMap[id]
}

function getTabIDFromWebContents (contents) {
  for (var id in viewMap) {
    if (viewMap[id].webContents === contents) {
      return id
    }
  }
}

ipc.on('createView', function (e, args) {
  createView(args.existingViewId, args.id, args.webPreferences, args.boundsString, args.events)
})

ipc.on('destroyView', function (e, id) {
  destroyView(id)
})

ipc.on('destroyAllViews', function () {
  destroyAllViews()
})

ipc.on('setView', function (e, args) {
  setView(args.id, e.sender)
  setBounds(args.id, args.bounds)
  if (args.focus && BrowserWindow.fromWebContents(e.sender) && BrowserWindow.fromWebContents(e.sender).isFocused()) {
    const couldFocus = focusView(args.id)
    if (!couldFocus) {
      e.sender.focus()
    }
  }
})

ipc.on('setBounds', function (e, args) {
  setBounds(args.id, args.bounds)
})

ipc.on('focusView', function (e, id) {
  focusView(id)
})

ipc.on('hideCurrentView', function (e) {
  hideCurrentView(e.sender)
})

function loadURLInView (id, url, win) {
  // wait until the first URL is loaded to set the background color so that new tabs can use a custom background
  if (!viewStateMap[id].loadedInitialURL) {
    // Give the site a chance to display something before setting the background, in case it has its own dark theme
    viewMap[id].webContents.once('dom-ready', function() {
      viewMap[id].setBackgroundColor('#fff')
    })
    // If the view has no URL, it won't be attached yet
    if (win && id === windows.getState(win).selectedView) {
      win.setBrowserView(viewMap[id])
    }
  }
  viewMap[id].webContents.loadURL(url)
  viewStateMap[id].loadedInitialURL = true
}

ipc.on('loadURLInView', function (e, args) {
  const win = windows.windowFromContents(e.sender)?.win
  loadURLInView(args.id, args.url, win)
})

ipc.on('callViewMethod', function (e, data) {
  var error, result
  try {
    var webContents = viewMap[data.id].webContents
    var methodOrProp = webContents[data.method]
    if (methodOrProp instanceof Function) {
      // call function
      result = methodOrProp.apply(webContents, data.args)
    } else {
      // set property
      if (data.args && data.args.length > 0) {
        webContents[data.method] = data.args[0]
      }
      // read property
      result = methodOrProp
    }
  } catch (e) {
    error = e
  }
  if (result instanceof Promise) {
    result.then(function (result) {
      if (data.callId) {
        e.sender.send('async-call-result', { callId: data.callId, error: null, result })
      }
    })
    result.catch(function (error) {
      if (data.callId) {
        e.sender.send('async-call-result', { callId: data.callId, error, result: null })
      }
    })
  } else if (data.callId) {
    e.sender.send('async-call-result', { callId: data.callId, error, result })
  }
})

ipc.on('getCapture', function (e, data) {
  var view = viewMap[data.id]
  if (!view) {
    // view could have been destroyed
    return
  }

  view.webContents.capturePage().then(function (img) {
    var size = img.getSize()
    if (size.width === 0 && size.height === 0) {
      return
    }
    img = img.resize({ width: data.width, height: data.height })
    e.sender.send('captureData', { id: data.id, url: img.toDataURL() })
  })
})

ipc.on('saveViewCapture', function (e, data) {
  var view = viewMap[data.id]
  if (!view) {
    // view could have been destroyed
  }

  view.webContents.capturePage().then(function (image) {
    view.webContents.downloadURL(image.toDataURL())
  })
})

global.getView = getView
