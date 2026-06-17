import { useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import CardPreview from '../components/CardPreview.jsx'
import Topbar from '../components/Topbar.jsx'
import { money } from '../utils/format.js'
import { newIdempotencyKey } from '../utils/idempotency.js'
import { createTransaction, errorMessage } from '../api.js'

export default function Dashboard() {
  const { balance, refreshBalance } = useAppData()
  const [form, setForm] = useState({
    card_number: '4111111111111111', holder_name: 'Joao Silva',
    expiration: '12/29', cvv: '123', amount_cents: '10000',
    installments: '1', description: 'Compra SENAI',
  })
  const [focused, setFocused] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [idemKey, setIdemKey] = useState(newIdempotencyKey)

  const set = name => e => setForm(f => ({ ...f, [name]: e.target.value }))
  const bind = name => ({
    value: form[name],
    onChange: set(name),
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)
    const payload = {
      card_number: form.card_number.replace(/\D/g, ''),
      holder_name: form.holder_name,
      expiration: form.expiration,
      cvv: form.cvv.replace(/\D/g, ''),
      amount_cents: Number(form.amount_cents),
      installments: Number(form.installments),
      description: form.description,
    }
    try {
      const { res, data } = await createTransaction(payload, idemKey)
      if (res.ok) {
        // Transação criada ou retornada por idempotência — regenerar chave para próximo pagamento
        setIdemKey(newIdempotencyKey())
        setFeedback(data.status === 'approved'
          ? { type: 'success', message: 'Transação aprovada!' }
          : { type: 'error', message: 'Transação recusada.' })
      } else {
        // Erro de validação (422) — manter mesma chave, retry é seguro
        setFeedback({ type: 'error', message: errorMessage(res, data) })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erro de conexão.' })
    } finally {
      await refreshBalance()
      setLoading(false)
    }
  }

  return (
    <div>
      <Topbar title="Gateway de Pagamento" subtitle="Crie pagamentos, acompanhe o saldo em tempo real." />
      <div className="bento-grid">

        {/* 2 colunas — cartão ao vivo (decorativo) */}
        <div className="bento-card-preview glass-card">
          <CardPreview
            cardNumber={form.card_number}
            holderName={form.holder_name}
            expiration={form.expiration}
            cvv={form.cvv}
            focused={focused}
          />
        </div>

        {/* 1 coluna — saldo */}
        <div className="bento-stat-1 glass-card stat-tile">
          <p className="stat-label">Saldo Líquido</p>
          <span className="stat-value display-balance" data-value={balance.balance_cents}>
            {money(balance.balance_cents)}
          </span>
        </div>

        {/* 1 coluna — aprovadas */}
        <div className="bento-stat-2 glass-card stat-tile">
          <p className="stat-label">Aprovadas</p>
          <span className="stat-value display-total-approved" data-value={balance.total_approved}>
            {balance.total_approved}
          </span>
        </div>

        {/* 1 coluna — recusadas */}
        <div className="bento-stat-3 glass-card stat-tile">
          <p className="stat-label">Recusadas</p>
          <span className="stat-value display-total-declined" data-value={balance.total_declined}>
            {balance.total_declined}
          </span>
        </div>

        {/* 3 colunas — formulário */}
        <div className="bento-form glass-card">
          <h2>Novo Pagamento</h2>
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-field full">
              <label>Número do cartão</label>
              <input className="input-card-number" {...bind('card_number')} inputMode="numeric" maxLength="19" />
            </div>
            <div className="form-field">
              <label>Titular</label>
              <input className="input-holder-name" {...bind('holder_name')} maxLength="50" />
            </div>
            <div className="form-field">
              <label>Validade</label>
              <input className="input-expiration" {...bind('expiration')} placeholder="MM/YY" maxLength="5" />
            </div>
            <div className="form-field">
              <label>CVV</label>
              <input className="input-cvv" {...bind('cvv')} inputMode="numeric" maxLength="4" />
            </div>
            <div className="form-field">
              <label>Valor (centavos)</label>
              <input className="input-amount" {...bind('amount_cents')} type="number" min="1" max="1000000" />
            </div>
            <div className="form-field">
              <label>Parcelas</label>
              <select className="select-installments" value={form.installments} onChange={set('installments')}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n =>
                  <option key={n} value={n}>{n}x</option>
                )}
              </select>
            </div>
            <div className="form-field full">
              <label>Descrição</label>
              <input className="input-description" {...bind('description')} maxLength="100" />
            </div>
            <button className="btn-pay" type="submit" disabled={loading || !Number(form.amount_cents)}>
              {loading ? 'Enviando…' : 'Pagar'}
            </button>
          </form>
          {feedback?.type === 'success' && <p className="feedback-success">{feedback.message}</p>}
          {feedback?.type === 'error'   && <p className="feedback-error">{feedback.message}</p>}
        </div>

        {/* 2 colunas — resumo / estornadas */}
        <div className="bento-activity glass-card">
          <h2>Resumo</h2>
          <div className="stat-tile" style={{ marginTop: 12 }}>
            <p className="stat-label">Estornadas</p>
            <span className="stat-value display-total-refunded" data-value={balance.total_refunded}>
              {balance.total_refunded}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
