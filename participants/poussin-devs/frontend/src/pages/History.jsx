import { Link } from 'react-router'
import { usePaginatedTransactions } from '../hooks/usePaginatedTransactions.js'
import { refundTransaction } from '../api.js'
import StatusPill from '../components/ui/StatusPill.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { money } from '../utils/format.js'

export default function History() {
  const { transactions, pagination, loading, error, page, goTo, reload } = usePaginatedTransactions()

  async function handleRefund(id) {
    await refundTransaction(id)
    await reload()
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Histórico de Transações</h1>
          <p className="muted">Transações paginadas com detalhes, status e estorno rápido.</p>
        </div>
      </header>

      <div className="list-transactions">
        {loading && <p className="muted">Carregando...</p>}
        {!loading && error && <p className="feedback-error">{error}</p>}
        {!loading && !error && transactions.length === 0 && (
          <EmptyState message="Nenhuma transação encontrada." />
        )}
        {transactions.map(tx => (
          <div className="transaction-item" key={tx.id}>
            <div className="transaction-head">
              <p>
                ID:{' '}
                <Link className="transaction-id" data-value={tx.id} to={`/transaction/${tx.id}`}>
                  {tx.id}
                </Link>
              </p>
              <StatusPill
                className="transaction-status"
                status={tx.status}
                data-value={tx.status}
              />
            </div>
            <div className="transaction-grid">
              <p className="transaction-row"><span>Valor</span><span className="transaction-amount" data-value={tx.amount_cents}>{money(tx.amount_cents)}</span></p>
              <p className="transaction-row"><span>Bandeira</span><span className="transaction-brand" data-value={tx.card_brand}>{tx.card_brand}</span></p>
              <p className="transaction-row"><span>Parcelas</span><span className="transaction-installments" data-value={tx.installments}>{tx.installments}</span></p>
              <p className="transaction-row"><span>Valor parcela</span><span className="transaction-installment-amount" data-value={tx.installment_amount}>{money(tx.installment_amount)}</span></p>
              <p className="transaction-row"><span>Total c/ juros</span><span className="transaction-total" data-value={tx.total_with_interest}>{money(tx.total_with_interest)}</span></p>
              <p className="transaction-row"><span>Taxa</span><span className="transaction-fee" data-value={tx.fee_cents}>{money(tx.fee_cents)}</span></p>
              <p className="transaction-row"><span>Descrição</span><span className="transaction-description" data-value={tx.description}>{tx.description}</span></p>
              <p className="transaction-row"><span>Cartão</span><span className="transaction-card" data-value={tx.card_last4}>{tx.card_last4}</span></p>
              <p className="transaction-row"><span>Data</span><span className="transaction-date" data-value={tx.created_at}>{tx.created_at}</span></p>
            </div>
            {tx.status === 'approved' && (
              <button className="btn-refund" onClick={() => handleRefund(tx.id)}>Estornar</button>
            )}
          </div>
        ))}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.total_pages}
        total={pagination.total}
        onPrev={() => goTo(page - 1)}
        onNext={() => goTo(page + 1)}
      />
    </div>
  )
}
