import { useRef, useEffect, useState, useCallback } from 'react'
import { formatBrand } from '../../utils/format.js'

function ChipSVG() {
  return (
    <svg width="46" height="38" viewBox="0 0 46 38" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cg-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F3E2A9"/>
          <stop offset="35%"  stopColor="#D8B968"/>
          <stop offset="70%"  stopColor="#B8954A"/>
          <stop offset="100%" stopColor="#9C7D3D"/>
        </linearGradient>
        <radialGradient id="cg-sheen" cx="25%" cy="20%" r="75%">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect x="0.5" y="0.5" width="45" height="37" rx="5" fill="url(#cg-body)" stroke="#7A6230" strokeWidth="0.5"/>
      <rect x="0.5" y="0.5" width="45" height="37" rx="5" fill="url(#cg-sheen)"/>

      <g stroke="#7A6230" strokeWidth="0.7" fill="none" opacity="0.80">
        <line x1="0.5" y1="13" x2="45.5" y2="13"/>
        <line x1="0.5" y1="25" x2="45.5" y2="25"/>
        <line x1="16"  y1="0.5" x2="16"  y2="13"/>
        <line x1="16"  y1="25"  x2="16"  y2="37.5"/>
        <line x1="30"  y1="13"  x2="30"  y2="25"/>
        <line x1="10"  y1="13"  x2="10"  y2="25"/>
      </g>
    </svg>
  )
}

function BrandIcon({ brand }) {
  if (brand === 'visa') {
    return (
      <svg width="54" height="20" viewBox="0 0 54 20" fill="none" aria-label="Visa">
        <text x="1" y="17" fontFamily="'Arial Black', Arial, sans-serif" fontSize="19"
          fontWeight="900" fontStyle="italic" fill="#FFFFFF" letterSpacing="-0.5">VISA</text>
      </svg>
    )
  }
  if (brand === 'mastercard') {
    return (
      <svg width="42" height="26" viewBox="0 0 42 26" fill="none" aria-label="MasterCard">
        <circle cx="15" cy="13" r="12" fill="#EB001B"/>
        <circle cx="27" cy="13" r="12" fill="#F79E1B"/>
        {/* Lente de intersecção */}
        <path d="M21 2.61 A12 12 0 0 1 21 23.39 A12 12 0 0 0 21 2.61Z" fill="#FF5F00"/>
      </svg>
    )
  }
  if (brand === 'amex') {
    return (
      <svg width="52" height="26" viewBox="0 0 52 26" fill="none" aria-label="Amex">
        <rect width="52" height="26" rx="4" fill="#2E77BC"/>
        <text x="26" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11"
          fontWeight="700" fill="#FFFFFF" letterSpacing="2">AMEX</text>
      </svg>
    )
  }
  if (brand === 'elo') {
    return (
      <svg width="46" height="22" viewBox="0 0 46 22" fill="none" aria-label="Elo">
        <text x="0" y="18" fontFamily="'Arial Black', Arial, sans-serif" fontSize="20"
          fontWeight="900" fill="#FFD700" letterSpacing="-0.5">elo</text>
      </svg>
    )
  }
  return null
}

// ─────────── Configuração de movimento ───────────
const DEFAULT_RX = 6            // tilt inicial (frente visível com espessura)
const DEFAULT_RY = -12
const MAX_RX = 85               // não deixa virar de cabeça para baixo
const MIN_RX = -85
const FRICTION = 0.92           // decay da inércia por frame
const VELOCITY_SCALE = 0.5      // graus por pixel de drag
const INERTIA_CUTOFF = 0.05     // deg/frame abaixo do qual paramos
const AUTO_RETURN_DELAY = 1800  // ms
const FLIP_RX = 4               // ângulo quando mostra o verso (CVV focado)
const FLIP_RY = 178

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CreditCard3D({
  cardNumber = '',
  holderName = '',
  expiration = '',
  cvv = '',
  brand = '',
  flipToBack = false,
}) {
  const cardRef = useRef(null)
  const frontShineRef = useRef(null)
  const backShineRef = useRef(null)
  const rotState = useRef({ x: DEFAULT_RX, y: DEFAULT_RY })
  const dragState = useRef({
    active: false, startX: 0, startY: 0,
    startRx: 0, startRy: 0,
    lastX: 0, lastY: 0, lastT: 0,
  })
  const velocity = useRef({ vx: 0, vy: 0 })
  const inertiaRaf = useRef(null)
  const autoReturnTimer = useRef(null)

  const [isDragging, setIsDragging] = useState(false)

  // ─────────── Aplica transform direto no DOM (sem re-render) ───────────
  const applyTransform = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform =
      `rotateX(${rotState.current.x.toFixed(2)}deg) rotateY(${rotState.current.y.toFixed(2)}deg)`

    const sx = (50 - rotState.current.y * 0.55).toFixed(1)
    const sy = (50 - rotState.current.x * 0.75).toFixed(1)
    const shine = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.07) 45%, transparent 70%)`
    if (frontShineRef.current) frontShineRef.current.style.background = shine
    if (backShineRef.current) backShineRef.current.style.background = shine
  }, [])

  const cancelAutoReturn = useCallback(() => {
    if (autoReturnTimer.current) {
      clearTimeout(autoReturnTimer.current)
      autoReturnTimer.current = null
    }
  }, [])

  const scheduleAutoReturn = useCallback(() => {
    cancelAutoReturn()
    if (prefersReducedMotion()) {
      rotState.current = { x: DEFAULT_RX, y: DEFAULT_RY }
      applyTransform()
      return
    }
    autoReturnTimer.current = setTimeout(() => {
      rotState.current = { x: DEFAULT_RX, y: DEFAULT_RY }
      cardRef.current?.classList.remove('is-dragging')
      applyTransform()
    }, AUTO_RETURN_DELAY)
  }, [applyTransform, cancelAutoReturn])

  // ─────────── Inércia (após soltar com velocidade) ───────────
  const runInertia = useCallback(() => {
    if (prefersReducedMotion()) {
      velocity.current = { vx: 0, vy: 0 }
      scheduleAutoReturn()
      return
    }
    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.max(1, now - last)
      last = now
      const factor = dt / 16.67 // normaliza para 60fps

      rotState.current.x += velocity.current.vy * factor
      rotState.current.y += velocity.current.vx * factor
      rotState.current.x = Math.max(MIN_RX, Math.min(MAX_RX, rotState.current.x))

      velocity.current.vx *= Math.pow(FRICTION, factor)
      velocity.current.vy *= Math.pow(FRICTION, factor)

      applyTransform()

      if (
        Math.abs(velocity.current.vx) > INERTIA_CUTOFF ||
        Math.abs(velocity.current.vy) > INERTIA_CUTOFF
      ) {
        inertiaRaf.current = requestAnimationFrame(tick)
      } else {
        inertiaRaf.current = null
        cardRef.current?.classList.remove('is-dragging')
        scheduleAutoReturn()
      }
    }
    inertiaRaf.current = requestAnimationFrame(tick)
  }, [applyTransform, scheduleAutoReturn])

  // ─────────── Auto-flip para o verso quando CVV ganha foco ───────────
  useEffect(() => {
    if (flipToBack) {
      if (inertiaRaf.current) {
        cancelAnimationFrame(inertiaRaf.current)
        inertiaRaf.current = null
      }
      cancelAutoReturn()
      velocity.current = { vx: 0, vy: 0 }
      rotState.current = { x: FLIP_RX, y: FLIP_RY }
      cardRef.current?.classList.remove('is-dragging')
      applyTransform()
    } else if (!dragState.current.active && !inertiaRaf.current) {
      scheduleAutoReturn()
    }
  }, [flipToBack, applyTransform, cancelAutoReturn, scheduleAutoReturn])

  // ─────────── Pointer events (mouse + touch unificados) ───────────
  const onPointerDown = useCallback((e) => {
    if (inertiaRaf.current) {
      cancelAnimationFrame(inertiaRaf.current)
      inertiaRaf.current = null
    }
    cancelAutoReturn()
    velocity.current = { vx: 0, vy: 0 }
    dragState.current = {
      active: true,
      startX: e.clientX, startY: e.clientY,
      startRx: rotState.current.x, startRy: rotState.current.y,
      lastX: e.clientX, lastY: e.clientY,
      lastT: performance.now(),
    }
    setIsDragging(true)
    cardRef.current?.classList.add('is-dragging')
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }, [cancelAutoReturn])

  const onPointerMove = useCallback((e) => {
    if (!dragState.current.active) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    let nx = dragState.current.startRx - dy * VELOCITY_SCALE
    const ny = dragState.current.startRy + dx * VELOCITY_SCALE
    nx = Math.max(MIN_RX, Math.min(MAX_RX, nx))
    rotState.current.x = nx
    rotState.current.y = ny

    // Velocidade (deg/frame a 60fps) — média móvel exponencial
    const now = performance.now()
    const dt = now - dragState.current.lastT
    if (dt > 0) {
      const vx = (e.clientX - dragState.current.lastX) / dt * VELOCITY_SCALE * 16.67
      const vy = -(e.clientY - dragState.current.lastY) / dt * VELOCITY_SCALE * 16.67
      velocity.current.vx = velocity.current.vx * 0.6 + vx * 0.4
      velocity.current.vy = velocity.current.vy * 0.6 + vy * 0.4
    }
    dragState.current.lastX = e.clientX
    dragState.current.lastY = e.clientY
    dragState.current.lastT = now

    applyTransform()
  }, [applyTransform])

  const onPointerUp = useCallback((e) => {
    if (!dragState.current.active) return
    dragState.current.active = false
    setIsDragging(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}

    const speed = Math.hypot(velocity.current.vx, velocity.current.vy)
    if (speed > 1.5 && !prefersReducedMotion()) {
      runInertia()
    } else {
      cardRef.current?.classList.remove('is-dragging')
      scheduleAutoReturn()
    }
  }, [runInertia, scheduleAutoReturn])

  // Cleanup
  useEffect(() => {
    return () => {
      if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current)
      cancelAutoReturn()
    }
  }, [cancelAutoReturn])

  // ─────────── Display values ───────────
  const last4 = cardNumber.length === 16 ? cardNumber.slice(12) : '••••'
  const padded = (cardNumber || '').padEnd(16, '•')
  const displayNumber = padded.replace(/(.{4})/g, '$1 ').trim()
  const displayHolder = holderName || 'NOME DO TITULAR'
  const displayExp = expiration || 'MM/YY'
  const displayBrand = brand ? formatBrand(brand) : ''
  const displayCvv = cvv || '•••'

  return (
    <div className="credit-card-3d-stage">
      <div className="cc-hint" aria-hidden="true">
        {isDragging
          ? 'Solte para girar livremente'
          : flipToBack
            ? 'Digite o CVV · volte para ver a frente'
            : 'Arraste para girar · foque o CVV para ver o verso'}
      </div>
      <div
        className="credit-card-3d-interactive"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label={`Cartão virtual${displayBrand ? ` ${displayBrand}` : ''}, número terminado em ${last4}`}
      >
        <div className="credit-card-preview credit-card-3d" ref={cardRef}>
          {/* ───── FRENTE ───── */}
          <div className="cc-face cc-front">
            <div className="cc-top">
              <ChipSVG />
              <div className="cc-brand">
                {brand ? <BrandIcon brand={brand} /> : displayBrand}
              </div>
            </div>
            <div className="cc-number">•••• •••• •••• {last4}</div>
            <div className="cc-bottom">
              <div>
                <div className="cc-label">Titular</div>
                <div className="cc-value">{displayHolder}</div>
              </div>
              <div>
                <div className="cc-label">Validade</div>
                <div className="cc-value">{displayExp}</div>
              </div>
            </div>
            <div className="cc-shine" ref={frontShineRef} />
          </div>

          {/* ───── VERSO ───── */}
          <div className="cc-face cc-back">
            <div className="cc-magnetic-stripe" />
            <div className="cc-back-content">
              <div className="cc-signature-row">
                <div className="cc-signature-panel" />
                <div className="cc-cvv-box">
                  <span className="cc-cvv-label">CVV</span>
                  <span className="cc-cvv-value">{displayCvv}</span>
                </div>
              </div>
              <div className="cc-back-footer">
                <div className="cc-back-legal">
                  Este cartão é propriedade do banco emissor. Uso sujeito aos termos do contrato. Em caso de perda ou roubo, comunique imediatamente o SAC.
                </div>
                <div className="cc-back-brand">
                  {brand ? <BrandIcon brand={brand} /> : displayBrand}
                </div>
              </div>
            </div>
            <div className="cc-shine" ref={backShineRef} />
          </div>

          {/* ───── ARESTAS insetadas — ficam atrás dos cantos arredondados da frente/verso ───── */}
          <div className="cc-face cc-edge cc-edge-top" />
          <div className="cc-face cc-edge cc-edge-bottom" />
          <div className="cc-face cc-edge cc-edge-left" />
          <div className="cc-face cc-edge cc-edge-right" />
        </div>
        <div className="cc-ground-shadow" />
      </div>
    </div>
  )
}
