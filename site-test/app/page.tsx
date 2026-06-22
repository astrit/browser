'use client'

import { useState } from 'react'

export default function Home() {
  const [passthroughEnabled, setPassthroughEnabled] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  return (
    <main className="transparent-root">
      <div
        className={`pass-through-target${passthroughEnabled ? ' is-passthrough' : ''}`}
        onClick={() => setClickCount((count) => count + 1)}
      >
        <div className="test-card">
          <h1>Transparent Surface</h1>
          <p>Click count: {clickCount}</p>
          <p>{passthroughEnabled ? 'Pointer events: OFF' : 'Pointer events: ON'}</p>
        </div>
      </div>
      <div className="debug-chip">Transparent Next Test</div>

      <section className="control-panel">
        <h2>Passthrough Mode</h2>
        <button
          className={`mode-toggle${passthroughEnabled ? ' is-active' : ''}`}
          onClick={() => setPassthroughEnabled((value) => !value)}
          type="button"
        >
          {passthroughEnabled ? 'Disable Passthrough' : 'Enable Passthrough'}
        </button>
        <p className="control-note">
          When enabled, the test surface uses pointer-events: none so clicks should pass through if
          your Electron host allows it.
        </p>
      </section>

      <div className="hint">
        html/body are fully transparent. Toggle passthrough and click the center card area to test
        whether events are intercepted by this page or passed through by your browser shell.
      </div>
    </main>
  )
}
