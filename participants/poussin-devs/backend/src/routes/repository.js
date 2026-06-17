import prisma from '../db.js'

// Meia-noite do dia atual no horário local — usado para calcular o limite diário por cartão.
function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Retorna o saldo consolidado: soma do net_amount das aprovadas e contagens por status.
export async function getBalance() {
  const [approvedSum, totalApproved, totalDeclined, totalRefunded] = await Promise.all([
    prisma.transaction.aggregate({ where: { status: 'approved' }, _sum: { netAmount: true } }),
    prisma.transaction.count({ where: { status: 'approved' } }),
    prisma.transaction.count({ where: { status: 'declined' } }),
    prisma.transaction.count({ where: { status: 'refunded' } })
  ])
  return {
    balance_cents: approvedSum._sum.netAmount || 0,
    total_approved: totalApproved,
    total_declined: totalDeclined,
    total_refunded: totalRefunded
  }
}

// Busca uma transação existente pela chave de idempotência.
// Retorna null se não existir — usado para evitar duplicatas.
export async function findByIdempotencyKey(idempotencyKey) {
  return prisma.transaction.findUnique({ where: { idempotencyKey } })
}

// Soma o total_with_interest das transações aprovadas do cartão no dia de hoje.
// Transações declined não contam no limite — só approved.
export async function getDailyTotal(cardLast4) {
  const daily = await prisma.transaction.aggregate({
    where: { cardLast4, status: 'approved', createdAt: { gte: startOfToday() } },
    _sum: { totalWithInterest: true }
  })
  return daily._sum.totalWithInterest || 0
}

export async function createTransaction(data) {
  return prisma.transaction.create({ data })
}

export async function findById(id) {
  return prisma.transaction.findUnique({ where: { id } })
}

// Retorna a página de transações e o total geral para calcular total_pages no handler.
export async function listTransactions(skip, limit) {
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.transaction.count()
  ])
  return { items, total }
}

// Usa updateMany com WHERE status = 'approved' para garantir atomicidade:
// se dois requests de estorno chegarem ao mesmo tempo, apenas um vai encontrar
// status = 'approved' e o outro vai retornar count = 0.
export async function refundTransaction(id) {
  return prisma.transaction.updateMany({
    where: { id, status: 'approved' },
    data: { status: 'refunded' }
  })
}
