const BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : ''
const url = p => `${BASE}${p}`

export const apiUrl = url

export async function getHealth() {
  try { return (await fetch(url('/api/health'))).ok } catch { return false }
}

export async function getBalance() {
  const res = await fetch(url('/api/balance'))
  if (!res.ok) throw new Error('balance')
  return res.json()
}

export async function listTransactions(page = 1, limit = 10) {
  const res = await fetch(url(`/api/transactions?page=${page}&limit=${limit}`))
  if (!res.ok) throw new Error('list')
  return res.json()
}

export async function getTransaction(id) {
  const res = await fetch(url(`/api/transactions/${id}`))
  if (!res.ok) throw new Error('get')
  return res.json()
}

export async function createTransaction(payload, idempotencyKey) {
  const res = await fetch(url('/api/transactions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, idempotency_key: idempotencyKey }),
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export async function refundTransaction(id) {
  const res = await fetch(url(`/api/transactions/${id}/refund`), { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export function errorMessage(res, data) {
  if (data?.errors?.length) return data.errors.join(', ')
  if (data?.error) return data.error
  return `Erro ${res.status}`
}
