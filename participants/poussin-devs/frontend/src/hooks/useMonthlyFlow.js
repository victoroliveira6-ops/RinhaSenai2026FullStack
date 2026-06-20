import { useEffect, useState } from 'react'
import { getTransactions } from '../api.js'

function monthKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function useMonthlyFlow() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    async function load() {
      const now = new Date()
      const windowStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const buckets = {}
      for (let i = 0; i < 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        buckets[monthKey(d)] = {
          in: 0,
          out: 0,
          label: d.toLocaleDateString('pt-BR', { month: 'short' }),
        }
      }

      let page = 1
      let stop = false
      while (!stop) {
        const res = await getTransactions(page, 100)
        if (!res.ok || !res.data?.data?.length) { stop = true; break }
        for (const tx of res.data.data) {
          const txDate = new Date(tx.created_at)
          if (txDate < windowStart) { stop = true; break }
          const key = monthKey(tx.created_at)
          if (!buckets[key]) continue
          if (tx.status === 'approved') buckets[key].in += tx.net_amount
          if (tx.status === 'refunded') buckets[key].out += tx.net_amount
        }
        if (stop) break
        if (page >= (res.data.pagination?.total_pages ?? 1)) { stop = true; break }
        page++
      }

      if (!cancelled) {
        setData(Object.values(buckets).reverse())
        setLoading(false)
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setError(true)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [tick])

  return {
    data,
    loading,
    error,
    refresh: () => setTick(t => t + 1),
  }
}
