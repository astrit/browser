import React from 'react'
import './address.css'

const AddressBar = ({
  url,
  setUrl
}: {
  url: string
  setUrl: React.Dispatch<React.SetStateAction<string>>
}): JSX.Element => {
  return (
    <nav className="address">
      <button>
        <svg viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button>
        <svg viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <button>
        <svg width="12" height="12" viewBox="0 0 24 24">
          <path d="M12.0001 4L12.0001 8" />
          <path d="M9 14L4.08509 17.4415" />
          <path d="M15 14L19.9149 17.4415" />
        </svg>
      </button>
      <input type="text" placeholder="/" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <button>
        <svg width="12" height="12" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </nav>
  )
}

export default AddressBar
