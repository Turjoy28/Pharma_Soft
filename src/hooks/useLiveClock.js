import { useState, useEffect } from 'react'

/**
 * ⏰ useLiveClock
 * Custom hook providing a real-time ticking clock string (HH:MM:SS) updated every second.
 *
 * @returns {string} Formatted 24-hour time string, e.g. "14:05:09"
 */
export function useLiveClock() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hrs = String(now.getHours()).padStart(2, '0')
      const mins = String(now.getMinutes()).padStart(2, '0')
      const secs = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hrs}:${mins}:${secs}`)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  return currentTime
}

