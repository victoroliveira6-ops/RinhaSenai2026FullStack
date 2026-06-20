export function money(cents = 0) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('pt-BR')
}

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpiration(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function formatBrand(b) {
  return ({ visa: 'Visa', mastercard: 'MasterCard', amex: 'Amex', elo: 'Elo' }[b] ?? b)
}

export function formatStatus(s) {
  return ({ approved: 'Aprovado', declined: 'Recusado', refunded: 'Estornado' }[s] ?? s)
}

export function formatInstallments(n) {
  return Number(n) === 1 ? 'À vista' : `${n}x`
}

export function detectBrand(cardNumber) {
  const n = String(cardNumber).replace(/\D/g, '')
  if (!n) return ''
  const first = n[0]
  if (first === '4') return 'visa'
  if (first === '5') return 'mastercard'
  if (first === '3') return 'amex'
  if (first === '6') return 'elo'
  return ''
}
