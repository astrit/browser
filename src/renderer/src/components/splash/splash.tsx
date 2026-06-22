import { useEffect, useState } from 'react'
import './splash.css'

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

const Splash = (): JSX.Element => {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(formatTime(new Date()))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="splash">
      <div className="clock">{time}</div>
    </div>
  )
}

export default Splash
