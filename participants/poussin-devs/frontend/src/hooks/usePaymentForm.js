import { useState, useCallback, useRef } from 'react'
import { createTransaction } from '../api.js'
import { formatCardNumber, formatExpiration } from '../utils/format.js'
import { newIdempotencyKey } from '../utils/idempotency.js'

const EMPTY = {
  card_number: '',
  holder_name: '',
  expiration: '',
  cvv: '',
  amount_cents: '',
  installments: '1',
  description: '',
}

const AUTO_DISMISS_MS = 10_000

export function usePaymentForm(onSuccess) {
  const [fields, setFields]           = useState(EMPTY)
  const [feedback, setFeedback]       = useState(null) // { type: 'success'|'error', title, detail }
  const [lastTx, setLastTx]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState(() => newIdempotencyKey())
  const timerRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'card_number') return setFields(p => ({ ...p, card_number: formatCardNumber(value) }))
    if (name === 'expiration')  return setFields(p => ({ ...p, expiration: formatExpiration(value) }))
    setFields(p => ({ ...p, [name]: value }))
  }

  const dismissFeedback = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setFeedback(null)
  }, [])

  function showFeedback(fb) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setFeedback(fb)
    timerRef.current = setTimeout(() => setFeedback(null), AUTO_DISMISS_MS)
  }

  const reset = useCallback(() => {
    setFields(EMPTY)
    dismissFeedback()
  }, [dismissFeedback])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    dismissFeedback()

    const payload = {
      card_number:     fields.card_number.replace(/\D/g, ''),
      holder_name:     fields.holder_name,
      expiration:      fields.expiration,
      cvv:             fields.cvv.replace(/\D/g, ''),
      amount_cents:    Number(fields.amount_cents),
      installments:    Number(fields.installments || 1),
      description:     fields.description,
      idempotency_key: idempotencyKey,
    }

    try {
      const { ok, data } = await createTransaction(payload)

      if (ok && data.status === 'approved') {
        setLastTx(data)
        showFeedback({ type: 'success', title: 'Transação aprovada!', detail: data.description || '' })
        setFields(EMPTY)
        setIdempotencyKey(newIdempotencyKey())
        await onSuccess?.()
      } else if (ok && data.status === 'declined') {
        setLastTx(data)
        showFeedback({ type: 'error', title: 'Transação recusada.', detail: 'Cartão não autorizado.' })
        await onSuccess?.()
      } else {
        const msg = data.errors?.join(', ') || data.error || 'Erro na transação.'
        showFeedback({ type: 'error', title: 'Erro ao processar', detail: msg })
      }
    } catch {
      showFeedback({ type: 'error', title: 'Falha de conexão', detail: 'Verifique a rede e tente novamente.' })
    } finally {
      setLoading(false)
    }
  }, [fields, idempotencyKey, onSuccess, dismissFeedback])

  return { fields, feedback, lastTx, loading, handleChange, submit, reset, dismissFeedback }
}
