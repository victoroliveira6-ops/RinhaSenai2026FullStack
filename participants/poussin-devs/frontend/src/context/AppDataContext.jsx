import { createContext, useContext, useEffect } from 'react'
import { useBalance } from '../hooks/useBalance.js'
import { useHealth } from '../hooks/useHealth.js'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const { balance, loading: balanceLoading, refresh: refreshBalance } = useBalance()
  const online = useHealth()

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  return (
    <AppDataContext.Provider value={{ balance, balanceLoading, refreshBalance, online }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  return useContext(AppDataContext)
}
