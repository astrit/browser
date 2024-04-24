const AddressBar = ({
  url,
  setUrl
}: {
  url: string
  setUrl: React.Dispatch<React.SetStateAction<string>>
}): JSX.Element => {
  return (
    <nav className="navbar" id="drag">
      <div className="container">
        <input
          type="text"
          className="form-control border-primary shadow-sm"
          id="no-drag"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
    </nav>
  )
}

export default AddressBar
