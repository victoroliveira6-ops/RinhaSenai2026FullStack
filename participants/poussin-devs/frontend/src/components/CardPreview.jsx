// CardPreview: cartão decorativo ao vivo — aria-hidden pois duplica dados do formulário.
// Props: cardNumber, holderName, expiration, cvv, focused
import { getBrand } from '../utils/brand.js'
import { formatCardNumber } from '../utils/format.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CardPreview({ cardNumber, holderName, expiration, cvv, focused }) {
  const brand = getBrand(cardNumber)
  const isFlipped = !reducedMotion && focused === 'cvv'
  const masked = cvv ? '•'.repeat(cvv.replace(/\D/g, '').length || 3) : '•••'

  return (
    <div className="card-preview-wrap" aria-hidden="true">
      <div className={`card-preview${isFlipped ? ' flipped' : ''}`}>
        <div className="card-face card-front">
          <div className="card-chip" />
          <div className="card-number-display">
            {formatCardNumber(cardNumber) || '•••• •••• •••• ••••'}
          </div>
          <div className="card-bottom">
            <div>
              <div className="card-info-label">Titular</div>
              <div className="card-info-value">{holderName || 'Nome do Titular'}</div>
            </div>
            <div>
              <div className="card-info-label">Validade</div>
              <div className="card-info-value">{expiration || 'MM/YY'}</div>
            </div>
            {brand && <div className="card-brand-mono">{brand.mono}</div>}
          </div>
        </div>
        <div className="card-face card-back">
          <div className="card-strip" />
          <div className="card-cvv-row">
            <span className="card-cvv-label">CVV</span>
            <span className="card-cvv-sig">{masked}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
