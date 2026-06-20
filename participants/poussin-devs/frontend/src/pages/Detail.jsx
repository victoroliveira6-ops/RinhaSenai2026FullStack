import { useParams } from 'react-router'
import { useTransaction } from '../hooks/useTransaction.js'
import { refundTransaction } from '../api.js'
import StatusPill from '../components/ui/StatusPill.jsx'
import { money } from '../utils/format.js'

export default function Detail() {
  const { id } = useParams()
  const { tx, loading, error, reload } = useTransaction(id)

  async function handleRefund() {
    await refundTransaction(id)
    await reload()
  }

  if (loading) return <div><h1>Detalhe da Transação</h1><p>Carregando...</p></div>
  if (error)   return <div><h1>Detalhe da Transação</h1><p className="feedback-error">{error}</p></div>
  if (!tx)     return null

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <header className="page-header">
        <div>
          <h1>Detalhe da Transação</h1>
          <p className="muted">Resumo completo da transação selecionada.</p>
        </div>
        {tx.status === 'approved' && (
          <button className="btn-refund" onClick={handleRefund}>Estornar</button>
        )}
      </header>

      <section className="detail-panel glass-card">
        <div className="detail-grid">
          <p className="detail-row"><span>ID</span><span className="detail-id" data-value={tx.id}>{tx.id}</span></p>
          <p className="detail-row"><span>Status</span><StatusPill className="detail-status" status={tx.status} data-value={tx.status} /></p>
          <p className="detail-row"><span>Valor</span><span className="detail-amount" data-value={tx.amount_cents}>{money(tx.amount_cents)}</span></p>
          <p className="detail-row"><span>Bandeira</span><span className="detail-brand" data-value={tx.card_brand}>{tx.card_brand}</span></p>
          <p className="detail-row"><span>Titular</span><span className="detail-holder" data-value={tx.holder_name}>{tx.holder_name}</span></p>
          <p className="detail-row"><span>Cartão</span><span className="detail-card" data-value={tx.card_last4}>{tx.card_last4}</span></p>
          <p className="detail-row"><span>Parcelas</span><span className="detail-installments" data-value={tx.installments}>{tx.installments}</span></p>
          <p className="detail-row"><span>Valor parcela</span><span className="detail-installment-amount" data-value={tx.installment_amount}>{money(tx.installment_amount)}</span></p>
          <p className="detail-row"><span>Total c/ juros</span><span className="detail-total" data-value={tx.total_with_interest}>{money(tx.total_with_interest)}</span></p>
          <p className="detail-row"><span>Taxa</span><span className="detail-fee" data-value={tx.fee_cents}>{money(tx.fee_cents)}</span></p>
          <p className="detail-row"><span>Valor líquido</span><span className="detail-net" data-value={tx.net_amount}>{money(tx.net_amount)}</span></p>
          <p className="detail-row"><span>Descrição</span><span className="detail-description" data-value={tx.description}>{tx.description}</span></p>
          <p className="detail-row"><span>Data</span><span className="detail-date" data-value={tx.created_at}>{tx.created_at}</span></p>
        </div>
      </section>
    </div>
  )
}
