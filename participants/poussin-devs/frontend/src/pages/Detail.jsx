import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { getTransaction, refundTransaction } from '../api.js'
import { money } from '../utils/format.js'
import Topbar from '../components/Topbar.jsx'
import StatusPill from '../components/StatusPill.jsx'

export default function Detail() {
  const { id } = useParams()
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try { setTx(await getTransaction(id)) }
    catch { setError('Transação não encontrada.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function doRefund() {
    await refundTransaction(id)
    load()
  }

  if (loading) return <div><Topbar title="Detalhe" /><div className="state-loading">Carregando…</div></div>
  if (error || !tx) return <div><Topbar title="Detalhe" /><div className="state-error">{error}</div></div>

  return (
    <div>
      <Topbar title="Detalhe da Transação" subtitle={tx.description}>
        {tx.status === 'approved' && (
          <button className="btn-refund" onClick={doRefund}>Estornar</button>
        )}
      </Topbar>
      <section className="glass-card">
        <div className="detail-grid">
          <div className="detail-row"><span>ID</span>          <span className="detail-id"          data-value={tx.id}>{tx.id}</span></div>
          <div className="detail-row"><span>Status</span>      <StatusPill status={tx.status} className="detail-status" /></div>
          <div className="detail-row"><span>Valor</span>       <span className="detail-amount"      data-value={tx.amount_cents}>{money(tx.amount_cents)}</span></div>
          <div className="detail-row"><span>Bandeira</span>    <span className="detail-brand"       data-value={tx.card_brand}>{tx.card_brand}</span></div>
          <div className="detail-row"><span>Titular</span>     <span className="detail-holder"      data-value={tx.holder_name}>{tx.holder_name}</span></div>
          <div className="detail-row"><span>Cartão</span>      <span className="detail-card"        data-value={tx.card_last4}>{tx.card_last4}</span></div>
          <div className="detail-row"><span>Parcelas</span>    <span className="detail-installments" data-value={tx.installments}>{tx.installments}</span></div>
          <div className="detail-row"><span>Valor parcela</span><span className="detail-installment-amount" data-value={tx.installment_amount}>{money(tx.installment_amount)}</span></div>
          <div className="detail-row"><span>Total c/ juros</span><span className="detail-total"     data-value={tx.total_with_interest}>{money(tx.total_with_interest)}</span></div>
          <div className="detail-row"><span>Taxa</span>        <span className="detail-fee"         data-value={tx.fee_cents}>{money(tx.fee_cents)}</span></div>
          <div className="detail-row"><span>Líquido</span>     <span className="detail-net"         data-value={tx.net_amount}>{money(tx.net_amount)}</span></div>
          <div className="detail-row"><span>Descrição</span>   <span className="detail-description" data-value={tx.description}>{tx.description}</span></div>
          <div className="detail-row"><span>Data</span>        <span className="detail-date"        data-value={tx.created_at}>{tx.created_at}</span></div>
        </div>
      </section>
    </div>
  )
}
