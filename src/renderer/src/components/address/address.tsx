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
      <nav>
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
      </nav>
      <div className="bar">
        <button>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
    </nav>
  )
}

export default AddressBar
