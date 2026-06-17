import { getCardBrand, calculateAmounts } from './domain.js'
import { cleanString, validateBody, createIdempotencyKey } from './validation.js'
import {
  getBalance, findByIdempotencyKey, getDailyTotal,
  createTransaction, findById, listTransactions, refundTransaction
} from './repository.js'

// Limite diário por cartão (identificado pelos últimos 4 dígitos): R$ 5.000,00
const DAILY_LIMIT_CENTS = 500000

// Fila de execução em memória por chave (ex: 'card:1234' ou 'refund:<id>').
// Garante que operações do mesmo cartão sejam executadas uma de cada vez,
// evitando race conditions na checagem do limite diário e no double refund.
const locks = new Map()
function withLock(key, fn) {
  const previous = locks.get(key) || Promise.resolve()
  const run = previous.then(fn, fn)
  // tail sempre resolve (nunca rejeita) para não bloquear o próximo na fila.
  const tail = run.catch(() => {})
  locks.set(key, tail)
  // Remove a entrada do Map após concluir, evitando vazamento de memória.
  tail.then(() => {
    if (locks.get(key) === tail) locks.delete(key)
  })
  return run
}

// Converte o modelo do banco (camelCase do Prisma) para o formato da API (snake_case).
// card_number nunca é retornado — apenas card_last4.
function formatTransaction(tx) {
  return {
    id: tx.id,
    status: tx.status,
    card_last4: tx.cardLast4,
    card_brand: tx.cardBrand,
    holder_name: tx.holderName,
    amount_cents: tx.amountCents,
    installments: tx.installments,
    installment_amount: tx.installmentAmount,
    total_with_interest: tx.totalWithInterest,
    fee_cents: tx.feeCents,
    net_amount: tx.netAmount,
    description: tx.description,
    created_at: tx.createdAt.toISOString()
  }
}

export default async function (fastify) {
  fastify.get('/health', async () => ({ status: 'ok' }))

  fastify.get('/balance', async () => {
    return getBalance()
  })

  fastify.post('/transactions', async (req, reply) => {
    const body = req.body || {}
    const errors = validateBody(body)
    if (errors.length) return reply.code(422).send({ errors })

    const cardNumber = body.card_number
    const cardLast4 = cardNumber.slice(-4)
    const idempotencyKey = createIdempotencyKey(body)

    // Lock por cartão: serializa requests do mesmo card_last4 para garantir
    // que a checagem do limite diário seja atômica.
    return withLock(`card:${cardLast4}`, async () => {
      // Se já existe uma transação com essa chave, retorna a existente sem criar outra.
      const existing = await findByIdempotencyKey(idempotencyKey)
      if (existing) return reply.code(200).send(formatTransaction(existing))

      const installments = body.installments ?? 1
      let status = 'approved'
      let brand = 'unknown'
      let feeRate = 0

      if (cardNumber.startsWith('9999')) {
        // Cartão de teste que sempre resulta em declined — salvo no banco mas sem efeito no saldo.
        status = 'declined'
      } else {
        const brandInfo = getCardBrand(cardNumber)
        if (!brandInfo) return reply.code(422).send({ error: 'Bandeira desconhecida' })
        brand = brandInfo.brand
        feeRate = brandInfo.feeRate
      }

      const amounts = calculateAmounts(body.amount_cents, installments, feeRate)

      // Valor mínimo por parcela: R$ 10,00 (1000 centavos)
      if (amounts.totalWithInterest / installments < 1000) {
        return reply.code(422).send({ error: 'Valor minimo por parcela e R$10,00' })
      }

      if (status === 'approved') {
        const current = await getDailyTotal(cardLast4)
        if (current + amounts.totalWithInterest > DAILY_LIMIT_CENTS) {
          // Limite excedido: declined (não 422) — a transação é salva no banco.
          status = 'declined'
        }
      }

      // Transações declined não têm taxa nem valor líquido — zeramos os campos financeiros.
      const tx = await createTransaction({
        idempotencyKey,
        status,
        cardLast4,
        cardBrand: brand,
        holderName: cleanString(body.holder_name),
        amountCents: body.amount_cents,
        installments,
        installmentAmount: amounts.installmentAmount,
        totalWithInterest: amounts.totalWithInterest,
        feeCents: status === 'approved' ? amounts.feeCents : 0,
        netAmount: status === 'approved' ? amounts.netAmount : 0,
        description: cleanString(body.description)
      })

      return reply.code(201).send(formatTransaction(tx))
    })
  })

  fastify.get('/transactions/:id', async (req, reply) => {
    const tx = await findById(req.params.id)
    if (!tx) return reply.code(404).send({ error: 'Transacao nao encontrada' })
    return formatTransaction(tx)
  })

  fastify.get('/transactions', async (req) => {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10) || 10, 1), 100)
    const skip = (page - 1) * limit

    const { items, total } = await listTransactions(skip, limit)

    return {
      data: items.map(formatTransaction),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  })

  fastify.post('/transactions/:id/refund', async (req, reply) => {
    // Lock por transação: impede que dois estornos simultâneos da mesma transação passem.
    return withLock(`refund:${req.params.id}`, async () => {
      const result = await refundTransaction(req.params.id)

      // count = 0 significa que a transação não estava com status 'approved'
      // (já foi estornada, está declined, ou não existe).
      if (result.count !== 1) {
        return reply.code(422).send({ error: 'Transacao nao pode ser estornada' })
      }

      const tx = await findById(req.params.id)
      return formatTransaction(tx)
    })
  })
}
