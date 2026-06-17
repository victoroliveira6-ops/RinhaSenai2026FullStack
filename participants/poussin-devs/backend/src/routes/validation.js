import crypto from 'node:crypto'

// Remove espaços no início e no fim; retorna string vazia se o valor não for string.
export function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Rejeita holder_name que contenha tags HTML para evitar XSS armazenado.
function hasHtmlTags(value) {
  return /<[^>]*>/g.test(value)
}

// Aceita cartões que vencem no mês atual — o cartão ainda é válido durante o mês.
function validateExpiration(expiration) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration || '')) return false

  const [monthStr, yearStr] = expiration.split('/')
  const month = Number(monthStr)
  const year = 2000 + Number(yearStr)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return year > currentYear || (year === currentYear && month >= currentMonth)
}

// Valida todos os campos obrigatórios do body e retorna lista de erros.
// Retornar array vazio significa que o body é válido.
export function validateBody(body) {
  const errors = []
  const installments = body.installments ?? 1
  const holderName = cleanString(body.holder_name)
  const description = cleanString(body.description)

  if (!Number.isInteger(body.amount_cents) || body.amount_cents <= 0 || body.amount_cents > 1000000) {
    errors.push('amount_cents invalido')
  }

  if (!/^\d{16}$/.test(body.card_number || '')) {
    errors.push('card_number invalido')
  }

  if (!/^\d{3,4}$/.test(body.cvv || '')) {
    errors.push('cvv invalido')
  }

  if (!holderName || holderName.length > 50 || hasHtmlTags(holderName)) {
    errors.push('holder_name invalido')
  }

  if (!validateExpiration(body.expiration)) {
    errors.push('expiration invalido')
  }

  if (!Number.isInteger(installments) || installments < 1 || installments > 12) {
    errors.push('installments invalido')
  }

  if (!description || description.length > 100) {
    errors.push('description invalida')
  }

  return errors
}

// Gera a chave de idempotência da transação.
// Se o cliente enviar `idempotency_key` no body, essa chave é usada diretamente.
// Caso contrário, gera um hash SHA-256 dos campos que identificam unicamente a transação,
// garantindo que dois requests idênticos não criem duas transações diferentes.
export function createIdempotencyKey(body) {
  if (typeof body.idempotency_key === 'string' && body.idempotency_key.trim()) {
    return body.idempotency_key.trim()
  }

  const payload = {
    card_number: body.card_number,
    holder_name: cleanString(body.holder_name),
    expiration: body.expiration,
    amount_cents: body.amount_cents,
    installments: body.installments ?? 1,
    description: cleanString(body.description)
  }

  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}
