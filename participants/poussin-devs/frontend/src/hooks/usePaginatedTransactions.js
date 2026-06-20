import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { getTransactions } from '../api.js'

export function usePaginatedTransactions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page  = Math.max(Number(searchParams.get('page')  || 1),   1)
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 100)

  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination]     = useState({ page, limit, total: 0, total_pages: 0 })
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { ok, data } = await getTransactions(page, limit)
      if (ok) {
        setTransactions(data.data || [])
        setPagination(data.pagination || { page, limit, total: 0, total_pages: 0 })
      } else {
        setError(data.error || 'Erro ao carregar transações.')
      }
    } catch {
      setError('Falha de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page, limit]) // eslint-disable-line react-hooks/exhaustive-deps

  function goTo(newPage) {
    setSearchParams({ page: String(newPage), limit: String(limit) })
  }

  return { transactions, pagination, loading, error, page, limit, goTo, reload: load }
}
