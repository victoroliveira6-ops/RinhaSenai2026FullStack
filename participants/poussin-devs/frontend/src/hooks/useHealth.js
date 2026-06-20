import { useState, useEffect } from 'react'
import { getHealth } from '../api.js'

const POLL_MS = 30_000

export function useHealth() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { ok } = await getHealth().catch(() => ({ ok: false }))
      if (!cancelled) setOnline(ok)
    }

    check()
    const id = setInterval(check, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return online
}
