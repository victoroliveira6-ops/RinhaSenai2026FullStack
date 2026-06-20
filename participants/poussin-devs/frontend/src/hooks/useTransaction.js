import { useState, useEffect } from 'react'
import { getTransaction } from '../api.js'

export function useTransaction(id) {
  const [tx, setTx]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { ok, data } = await getTransaction(id)
    if (ok) setTx(data)
    else setError(data.error || 'Transação não encontrada.')
    setLoading(false)
  }

  useEffect(() => {
    if (id) load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { tx, loading, error, reload: load }
}
