import { useRef, useState } from 'react'

function CardChip() {
  return (
    <svg className="card-chip-svg" viewBox="0 0 40 30" aria-hidden="true">
      <defs>
        <linearGradient id="chip-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3E2A9" />
          <stop offset="35%" stopColor="#D8B968" />
          <stop offset="70%" stopColor="#B8954A" />
          <stop offset="100%" stopColor="#9C7D3D" />
        </linearGradient>
        <radialGradient id="chip-sheen" cx="25%" cy="20%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0.5" y="0.5" width="39" height="29" rx="4" fill="url(#chip-metal)" stroke="#7A6230" strokeWidth="0.5" />
      <rect x="0.5" y="0.5" width="39" height="29" rx="4" fill="url(#chip-sheen)" />

      {/* contatos assimétricos, estilo ISO 7816 */}
      <g stroke="#7A6230" strokeWidth="0.6" fill="none" opacity="0.75">
        <line x1="0.5" y1="11" x2="39.5" y2="11" />
        <line x1="0.5" y1="19" x2="39.5" y2="19" />
        <line x1="14" y1="0.5" x2="14" y2="11" />
        <line x1="14" y1="19" x2="14" y2="29.5" />
        <line x1="26" y1="11" x2="26" y2="19" />
        <line x1="9" y1="11" x2="9" y2="19" />
      </g>
    </svg>
  )
}

function CardBack() {
  return (
    <>
      <div className="card-back-strip" />
      <div className="card-back-sig">
        <div className="card-back-sig-lines" />
        <span className="card-back-sig-cvv">CVV</span>
      </div>
    </>
  )
}

// aria-hidden on wrap: purely decorative — form fields are the accessible data source.
export default function CardPreview({ cardNumber = '', holderName = '', expiration = '' }) {
  const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '••••'
  const [rotation, setRotation] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startRotation = useRef(0)

  function onPointerDown(e) {
    setDragging(true)
    startX.current = e.clientX
    startRotation.current = rotation
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging) return
    const delta = e.clientX - startX.current
    setRotation(startRotation.current + delta * 0.5)
  }

  function onPointerUp() {
    setDragging(false)
    setRotation(0)
  }

  return (
    <div className="card-3d-wrap" aria-hidden="true">
      <div
        className={`card-3d${dragging ? ' dragging' : ''}`}
        style={{ transform: `rotateY(${rotation}deg)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="card-preview card-face front">
          <div className="card-chip">
            <CardChip />
          </div>
          <div className="card-preview-number">•••• •••• •••• {last4}</div>
          <div className="card-preview-footer">
            <span className="card-holder">
              {holderName || <span className="card-placeholder">TITULAR</span>}
            </span>
            <span>{expiration || 'MM/YY'}</span>
          </div>
        </div>

        <div className="card-face back">
          <CardBack />
        </div>
      </div>
    </div>
  )
}
