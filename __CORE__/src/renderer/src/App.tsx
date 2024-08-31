import { useRef, useState } from 'react'
import './assets/styles.css'
import AddressBar from './components/address/address'
// import useWindowsDimensions from './hooks/useWindowsDimensions'
import Splash from './components/splash/splash'

function App(): JSX.Element {
  const [url, setUrl] = useState<string>('')
  // const windowDimensions = useWindowsDimensions()
  const webviewRef = useRef<HTMLWebViewElement>(null)

  return (
    <>
      <AddressBar setUrl={setUrl} url={url} />
      {url ? (
        <webview ref={webviewRef} src={`${url.includes('https://') ? '' : 'https://'}${url}`} />
      ) : (
        <Splash />
      )}
    </>
  )
}

export default App
