export const money = (cents = 0) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatDate = (iso = '') =>
  iso ? new Date(iso).toLocaleString('pt-BR') : ''

export const formatCardNumber = (num = '') =>
  String(num).replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

export const formatExpiration = (str = '') => {
  const d = String(str).replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
}

export const maskCardLast4 = (num = '') => {
  const last4 = String(num).replace(/\D/g, '').slice(-4)
  return `•••• •••• •••• ${last4}`
}
