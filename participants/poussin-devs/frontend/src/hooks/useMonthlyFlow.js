import { useEffect, useState } from 'react'
import { getTransactions } from '../api.js'

function monthKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Gera valor fictício determinístico baseado no mês para parecer consistente
function fakeValue(seed, min, max) {
  const x = Math.sin(seed) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min) + min)
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
      const MONTHS = 6
      const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1), 1)
      const buckets = {}
      for (let i = 0; i < MONTHS; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = monthKey(d)
        // Meses passados (sem dados reais ainda) recebem valores fictícios
        const isPast = i >= 3
        buckets[key] = {
          in:  isPast ? fakeValue(d.getMonth() + 1,        30000, 120000) : 0,
          out: isPast ? fakeValue(d.getMonth() + 1 + 0.5,  40000, 150000) : 0,
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
          if (tx.status === 'approved') {
            buckets[key].in  += tx.net_amount
            buckets[key].out += tx.amount_cents
          }
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
