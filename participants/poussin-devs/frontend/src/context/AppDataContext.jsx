import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getBalance, getHealth } from '../api.js'

const Ctx = createContext(null)

export function AppDataProvider({ children }) {
  const [balance, setBalance] = useState({
    balance_cents: 0, total_approved: 0, total_declined: 0, total_refunded: 0,
  })
  const [isOnline, setIsOnline] = useState(true)

  const refreshBalance = useCallback(async () => {
    try { setBalance(await getBalance()) } catch {}
  }, [])

  useEffect(() => {
    refreshBalance()
    const id = setInterval(async () => setIsOnline(await getHealth()), 30000)
    return () => clearInterval(id)
  }, [refreshBalance])

  return <Ctx.Provider value={{ balance, refreshBalance, isOnline }}>{children}</Ctx.Provider>
}

export const useAppData = () => useContext(Ctx)
