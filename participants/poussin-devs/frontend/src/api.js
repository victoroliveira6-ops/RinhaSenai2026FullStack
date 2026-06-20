const API_ORIGIN = window.location.protocol === 'file:' ? 'http://localhost:3000' : ''

function url(path) {
  return `${API_ORIGIN}${path}`
}

async function request(path, options = {}) {
  const res = await fetch(url(path), {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

// Kept for any future direct URL construction needs.
export function apiUrl(path) {
  return url(path)
}

export async function getHealth() {
  return request('/api/health')
}

export async function getBalance() {
  return request('/api/balance')
}

export async function getTransactions(page = 1, limit = 10) {
  return request(`/api/transactions?page=${page}&limit=${limit}`)
}

export async function getTransaction(id) {
  return request(`/api/transactions/${id}`)
}

export async function createTransaction(payload) {
  return request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function refundTransaction(id) {
  return request(`/api/transactions/${id}/refund`, { method: 'POST' })
}
