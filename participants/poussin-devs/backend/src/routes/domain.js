// Retorna a bandeira e taxa da bandeira com base no primeiro dígito do cartão.
// Retorna null se o dígito não corresponde a nenhuma bandeira conhecida (causa 422).
export function getCardBrand(cardNumber) {
  const first = cardNumber[0]
  if (first === '4') return { brand: 'visa', feeRate: 0.025 }
  if (first === '5') return { brand: 'mastercard', feeRate: 0.03 }
  if (first === '3') return { brand: 'amex', feeRate: 0.035 }
  if (first === '6') return { brand: 'elo', feeRate: 0.04 }
  return null
}

// Calcula os valores financeiros da transação.
// Math.ceil é usado em vez de Math.round para nunca cobrar menos do que o devido.
export function calculateAmounts(amountCents, installments, feeRate) {
  // 1x não tem juros; 2-6x: 2% ao mês composto; 7-12x: 4% ao mês composto
  let interestRate = 0
  if (installments >= 2 && installments <= 6) interestRate = 0.02
  if (installments >= 7 && installments <= 12) interestRate = 0.04

  const totalWithInterest = Math.ceil(amountCents * Math.pow(1 + interestRate, installments))
  const installmentAmount = Math.ceil(totalWithInterest / installments)

  // A taxa incide sobre amount_cents (valor original), não sobre total_with_interest.
  // Essa é a regra validada pelos testes — diverge da documentação escrita.
  const feeCents = Math.round(amountCents * feeRate)
  const netAmount = amountCents - feeCents

  return { totalWithInterest, installmentAmount, feeCents, netAmount }
}
