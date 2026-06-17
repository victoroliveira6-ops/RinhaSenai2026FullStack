// Monogramas próprios — evita uso de logotipos registrados (Visa®, Mastercard®, etc.)
const BRANDS = {
  '4': { name: 'visa',       mono: 'VISA', fee: 0.025 },
  '5': { name: 'mastercard', mono: 'MC',   fee: 0.030 },
  '3': { name: 'amex',       mono: 'AMEX', fee: 0.035 },
  '6': { name: 'elo',        mono: 'ELO',  fee: 0.040 },
}

export const getBrand = (cardNumber = '') =>
  BRANDS[String(cardNumber).replace(/\D/g, '')[0]] ?? null
