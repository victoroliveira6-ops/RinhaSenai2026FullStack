import { useCallback, useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import { usePaymentForm } from '../hooks/usePaymentForm.js'
import { useGreeting } from '../hooks/useGreeting.js'
import { useMonthlyFlow } from '../hooks/useMonthlyFlow.js'
import CreditCard3D from '../components/ui/CreditCard3D.jsx'
import MonthlyFlowChart from '../components/ui/MonthlyFlowChart.jsx'
import { money, detectBrand, formatBrand, formatStatus, formatInstallments, formatDate } from '../utils/format.js'
import { USER_NAME } from '../config.js'

function TxRow({ label, children }) {
  return (
    <div className="tx-row">
      <span className="tx-row-label">{label}</span>
      <span className="tx-row-value">{children}</span>
    </div>
  )
}

export default function Dashboard() {
  const { balance, balanceLoading, refreshBalance } = useAppData()
  const { data: flowData, refresh: refreshFlow } = useMonthlyFlow()
  const [cvvFocused, setCvvFocused] = useState(false)

  const handleSuccess = useCallback(async () => {
    await refreshBalance()
    refreshFlow()
  }, [refreshBalance, refreshFlow])

  const { fields, feedback, lastTx, loading, handleChange, submit, dismissFeedback } = usePaymentForm(handleSuccess)
  const greeting = useGreeting(USER_NAME)
  const previewBrand = detectBrand(fields.card_number)

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>{greeting}</h1>
        </div>
      </header>

      {/* ── Métricas ── */}
      <section className="overview-section">
        <div className="bento-grid">
          {balanceLoading ? (
            <div className="stats-widget glass-card skeleton" style={{ height: 180 }} />
          ) : (
            <div className="stats-widget glass-card">
              <div className="stats-widget-header">
                <span className="stats-widget-label">Dívida mensal</span>
              </div>

              <div className="stats-widget-balance">
                <span className="display-balance" data-value={balance?.balance_cents}>
                  {money(balance?.balance_cents ?? 0)}
                </span>
              </div>

              <div className="stats-widget-divider" />

              <div className="stats-widget-rows">
                <div className="stats-row-item">
                  <span className="stats-row-label">Aprovadas</span>
                  <span className="display-total-approved stats-row-value approved"
                        data-value={balance?.total_approved}>
                    {balance?.total_approved ?? 0}
                  </span>
                </div>
                <div className="stats-row-item">
                  <span className="stats-row-label">Recusadas</span>
                  <span className="display-total-declined stats-row-value declined"
                        data-value={balance?.total_declined}>
                    {balance?.total_declined ?? 0}
                  </span>
                </div>
                <div className="stats-row-item">
                  <span className="stats-row-label">Estornadas</span>
                  <span className="display-total-refunded stats-row-value refunded"
                        data-value={balance?.total_refunded}>
                    {balance?.total_refunded ?? 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flow-chart-tile glass-card">
            <MonthlyFlowChart data={flowData ?? []} />
          </div>
        </div>
      </section>

      {/* ── Novo pagamento ── */}
      <section className="payment-section">
        <h2 className="section-title">Novo pagamento</h2>
        <div className="payment-section-grid">

          {/* Formulário — coluna esquerda */}
          <div className="payment-form-slot glass-card" style={{ padding: 'var(--space-6)' }}>
            <form className="payment-form" onSubmit={submit} noValidate>
              <div className="form-field full">
                <label htmlFor="card_number">Número do cartão</label>
                <input
                  id="card_number"
                  className="input-card-number"
                  name="card_number"
                  inputMode="numeric"
                  maxLength="19"
                  value={fields.card_number}
                  onChange={handleChange}
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div className="form-field">
                <label htmlFor="holder_name">Nome do titular</label>
                <input
                  id="holder_name"
                  className="input-holder-name"
                  name="holder_name"
                  maxLength="50"
                  value={fields.holder_name}
                  onChange={handleChange}
                  placeholder="NOME COMPLETO"
                />
              </div>
              <div className="form-field">
                <label htmlFor="expiration">Validade</label>
                <input
                  id="expiration"
                  className="input-expiration"
                  name="expiration"
                  inputMode="numeric"
                  maxLength="5"
                  value={fields.expiration}
                  onChange={handleChange}
                  placeholder="MM/YY"
                />
              </div>
              <div className="form-field">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  className="input-cvv"
                  name="cvv"
                  inputMode="numeric"
                  maxLength="4"
                  value={fields.cvv}
                  onChange={handleChange}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  placeholder="000"
                />
              </div>
              <div className="form-field">
                <label htmlFor="amount_cents">Valor em centavos</label>
                <input
                  id="amount_cents"
                  className="input-amount"
                  name="amount_cents"
                  type="number"
                  min="1"
                  max="1000000"
                  value={fields.amount_cents}
                  onChange={handleChange}
                  placeholder="10000"
                />
              </div>
              <div className="form-field">
                <label htmlFor="installments">Parcelas</label>
                <select
                  id="installments"
                  className="select-installments"
                  name="installments"
                  value={fields.installments}
                  onChange={handleChange}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={String(n)}>{n}x</option>
                  ))}
                </select>
              </div>
              <div className="form-field full">
                <label htmlFor="description">Descrição</label>
                <input
                  id="description"
                  className="input-description"
                  name="description"
                  maxLength="100"
                  value={fields.description}
                  onChange={handleChange}
                  placeholder="Descrição da compra"
                />
              </div>
              <button
                className="btn-pay"
                type="submit"
                disabled={loading}
                data-loading={loading ? 'true' : undefined}
              >
                {loading ? '' : 'Pagar'}
              </button>
            </form>

            {feedback?.type === 'success' && (
              <div className="feedback-success" role="status">
                <span className="feedback-icon feedback-icon--success">✓</span>
                <div className="feedback-content">
                  <div className="feedback-title">{feedback.title}</div>
                  {feedback.detail && <div className="feedback-detail">{feedback.detail}</div>}
                </div>
                <button className="feedback-dismiss" type="button" onClick={dismissFeedback} aria-label="Fechar">×</button>
                <div className="feedback-progress" />
              </div>
            )}
            {feedback?.type === 'error' && (
              <div className="feedback-error" role="alert">
                <span className="feedback-icon feedback-icon--error">!</span>
                <div className="feedback-content">
                  <div className="feedback-title">{feedback.title}</div>
                  {feedback.detail && <div className="feedback-detail">{feedback.detail}</div>}
                </div>
                <button className="feedback-dismiss" type="button" onClick={dismissFeedback} aria-label="Fechar">×</button>
                <div className="feedback-progress" />
              </div>
            )}
          </div>

          {/* Cartão 3D + última transação — coluna direita */}
          <div className="payment-card-slot">
            <CreditCard3D
              cardNumber={fields.card_number}
              holderName={fields.holder_name}
              expiration={fields.expiration}
              cvv={fields.cvv}
              brand={previewBrand}
              flipToBack={cvvFocused}
            />

            {lastTx && (
              <>
                <hr className="section-divider" />
                <div className="last-tx-panel">
                  <span className="last-tx-title">Última transação</span>
                  <TxRow label="ID">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8em' }}>
                      {lastTx.id?.slice(0, 8)}…
                    </span>
                  </TxRow>
                  <TxRow label="Status">
                    <span className={`badge badge-${lastTx.status}`}>
                      {formatStatus(lastTx.status)}
                    </span>
                  </TxRow>
                  <TxRow label="Valor">{money(lastTx.amount_cents)}</TxRow>
                  <TxRow label="Parcelas">{formatInstallments(lastTx.installments)}</TxRow>
                  {lastTx.card_brand && <TxRow label="Bandeira">{formatBrand(lastTx.card_brand)}</TxRow>}
                  {lastTx.card_last4 && <TxRow label="Cartão">•••• {lastTx.card_last4}</TxRow>}
                  {lastTx.description && <TxRow label="Descrição">{lastTx.description}</TxRow>}
                  <TxRow label="Data">{formatDate(lastTx.created_at)}</TxRow>
                </div>
              </>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
