import { useState, useCallback } from 'react'
import { getBalance } from '../api.js'

export function useBalance() {
  const [balance, setBalance] = useState({
    balance_cents: 0,
    total_approved: 0,
    total_declined: 0,
    total_refunded: 0,
  })
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { ok, data } = await getBalance()
    if (ok) setBalance(data)
    setLoading(false)
  }, [])

  return { balance, loading, refresh }
}
