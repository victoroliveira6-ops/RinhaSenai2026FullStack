const BRANDS = {
  '4': { name: 'visa',       monogram: 'VI', label: 'Visa',       gradient: 'linear-gradient(135deg, #8A93A6 0%, #C4CAD6 100%)' },
  '5': { name: 'mastercard', monogram: 'MC', label: 'Mastercard', gradient: 'linear-gradient(135deg, #EB5914 0%, #F7931A 100%)' },
  '3': { name: 'amex',       monogram: 'AX', label: 'Amex',       gradient: 'linear-gradient(135deg, #007B5E 0%, #00C7A3 100%)' },
  '6': { name: 'elo',        monogram: 'EL', label: 'Elo',        gradient: 'linear-gradient(135deg, #D4006A 0%, #FF4B8A 100%)' },
}

export function detectBrand(cardNumber) {
  const first = String(cardNumber || '').replace(/\D/g, '')[0]
  return BRANDS[first] ?? { name: 'unknown', monogram: '??', label: 'Desconhecida', gradient: null }
}

export function brandMonogram(cardBrand) {
  const entry = Object.values(BRANDS).find(b => b.name === cardBrand)
  return entry ? entry.monogram : '??'
}
