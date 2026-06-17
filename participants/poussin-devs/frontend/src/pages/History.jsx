import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { listTransactions, refundTransaction } from '../api.js'
import { money } from '../utils/format.js'
import Topbar from '../components/Topbar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import Pagination from '../components/Pagination.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function History() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page  = Math.max(Number(searchParams.get('page')  || 1),   1)
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 100)

  const [txs,  setTxs]  = useState([])
  const [pag,  setPag]  = useState({ page, limit, total: 0, total_pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const json = await listTransactions(page, limit)
      setTxs(json.data || [])
      setPag(json.pagination || { page, limit, total: 0, total_pages: 0 })
    } catch { setError('Falha ao carregar transações.') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [page, limit])

  async function doRefund(id) {
    await refundTransaction(id)
    load()
  }

  const goTo = p => setSearchParams({ page: String(p), limit: String(limit) })

  return (
    <div>
      <Topbar title="Histórico" subtitle="Transações paginadas com estorno rápido." />

      {loading && <div className="state-loading">Carregando…</div>}
      {error   && <div className="state-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="list-transactions">
            {txs.length === 0 && <EmptyState message="Nenhuma transação encontrada." />}
            {txs.map(tx => (
              <div className="transaction-item glass-card" key={tx.id}>
                <div className="transaction-head">
                  <Link className="transaction-id transaction-id-link" data-value={tx.id} to={`/transaction/${tx.id}`}>
                    {tx.id}
                  </Link>
                  <StatusPill status={tx.status} className="transaction-status" />
                </div>
                <div className="transaction-grid">
                  <div className="transaction-row"><span>Valor</span><span className="transaction-amount" data-value={tx.amount_cents}>{money(tx.amount_cents)}</span></div>
                  <div className="transaction-row"><span>Bandeira</span><span className="transaction-brand" data-value={tx.card_brand}>{tx.card_brand}</span></div>
                  <div className="transaction-row"><span>Parcelas</span><span className="transaction-installments" data-value={tx.installments}>{tx.installments}</span></div>
                  <div className="transaction-row"><span>Valor parcela</span><span className="transaction-installment-amount" data-value={tx.installment_amount}>{money(tx.installment_amount)}</span></div>
                  <div className="transaction-row"><span>Total c/ juros</span><span className="transaction-total" data-value={tx.total_with_interest}>{money(tx.total_with_interest)}</span></div>
                  <div className="transaction-row"><span>Taxa</span><span className="transaction-fee" data-value={tx.fee_cents}>{money(tx.fee_cents)}</span></div>
                  <div className="transaction-row"><span>Descrição</span><span className="transaction-description" data-value={tx.description}>{tx.description}</span></div>
                  <div className="transaction-row"><span>Cartão</span><span className="transaction-card" data-value={tx.card_last4}>{tx.card_last4}</span></div>
                  <div className="transaction-row"><span>Data</span><span className="transaction-date" data-value={tx.created_at}>{tx.created_at}</span></div>
                </div>
                {tx.status === 'approved' && (
                  <button className="btn-refund" onClick={() => doRefund(tx.id)}>Estornar</button>
                )}
              </div>
            ))}
          </div>
          <Pagination
            page={pag.page} totalPages={pag.total_pages} total={pag.total}
            onPrev={() => goTo(page - 1)} onNext={() => goTo(page + 1)}
          />
        </>
      )}
    </div>
  )
}
