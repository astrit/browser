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
    <nav className="address" id="drag">
      <input
        type="text"
        placeholder="Enter URL"
        id="no-drag"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
    </nav>
  )
}

export default AddressBar
