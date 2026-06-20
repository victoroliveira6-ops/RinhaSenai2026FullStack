import { useEffect, useState } from 'react'
import { getGreeting } from '../utils/greeting.js'

export function useGreeting(name) {
  const [greeting, setGreeting] = useState(() => getGreeting())

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60000)
    return () => clearInterval(id)
  }, [])

  return `${greeting}, ${name}`
}
