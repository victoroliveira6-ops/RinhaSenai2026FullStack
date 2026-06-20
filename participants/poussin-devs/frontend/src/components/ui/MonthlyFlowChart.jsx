const GROUP_W  = 150
const BAR_W    = 44
const BAR_GAP  = 10
const TOP_PAD  = 42
const MAX_BAR_H = 148
const BOT_PAD  = 30
const SVG_H    = TOP_PAD + MAX_BAR_H + BOT_PAD   // 220
const BAR_BOTTOM = TOP_PAD + MAX_BAR_H            // 190
const IN_OFF   = (GROUP_W - BAR_W * 2 - BAR_GAP) / 2
const OUT_OFF  = IN_OFF + BAR_W + BAR_GAP
const GRID_LINES = [0.25, 0.5, 0.75, 1]
const BAR_RADIUS = 5

function barPath(x, y, w, h, r) {
  const safeR = Math.min(r, h, w / 2)
  if (h <= 0) return ''
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + safeR}`,
    `Q ${x} ${y} ${x + safeR} ${y}`,
    `L ${x + w - safeR} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + safeR}`,
    `L ${x + w} ${y + h}`,
    'Z',
  ].join(' ')
}

function chartMoney(cents) {
  const reais = cents / 100
  if (reais >= 1000000) return `R$${(reais / 1000000).toFixed(1).replace('.', ',')}M`
  if (reais >= 1000)    return `R$${(reais / 1000).toFixed(1).replace('.', ',')}k`
  return `R$${Math.round(reais)}`
}

export default function MonthlyFlowChart({ data }) {
  if (!data || data.length === 0) return null
  const svgW  = GROUP_W * data.length
  const maxVal = Math.max(...data.flatMap(m => [m.in, m.out]), 1)

  return (
    <div className="flow-chart">
      {/* Legenda */}
      <div className="flow-chart-legend">
        <span className="flow-legend-dot flow-legend-dot--in" />
        <span className="flow-legend-label">Entrou</span>
        <span className="flow-legend-dot flow-legend-dot--out" />
        <span className="flow-legend-label">Saiu</span>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${SVG_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ flex: '1 1 0', width: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Gradientes das barras */}
          <linearGradient id="fc-grad-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3DD68C" stopOpacity="1" />
            <stop offset="100%" stopColor="#3DD68C" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="fc-grad-out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F2496B" stopOpacity="1" />
            <stop offset="100%" stopColor="#F2496B" stopOpacity="0.25" />
          </linearGradient>

          {/* Glow verde */}
          <filter id="fc-glow-in" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0 0 0 0 0.24  0 0 0 0 0.84  0 0 0 0 0.55  0 0 0 0.5 0"
              result="colored" />
            <feMerge>
              <feMergeNode in="colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow vermelho */}
          <filter id="fc-glow-out" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0 0 0 0 0.95  0 0 0 0 0.29  0 0 0 0 0.42  0 0 0 0.5 0"
              result="colored" />
            <feMerge>
              <feMergeNode in="colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines horizontais */}
        {GRID_LINES.map(pct => {
          const y = BAR_BOTTOM - pct * MAX_BAR_H
          return (
            <line
              key={pct}
              x1={0} y1={y} x2={svgW} y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray={pct === 1 ? '0' : '4 4'}
            />
          )
        })}

        {/* Linha de base */}
        <line
          x1={0} y1={BAR_BOTTOM} x2={svgW} y2={BAR_BOTTOM}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />

        {/* Grupos de barras */}
        {data.map((month, gi) => {
          const gx   = gi * GROUP_W
          const inH  = Math.round((month.in  / maxVal) * MAX_BAR_H)
          const outH = Math.round((month.out / maxVal) * MAX_BAR_H)
          const inX  = gx + IN_OFF
          const outX = gx + OUT_OFF
          const inY  = BAR_BOTTOM - (inH  || 2)
          const outY = BAR_BOTTOM - (outH || 2)

          return (
            <g key={month.label}>
              {/* Separador de grupo */}
              {gi > 0 && (
                <line
                  x1={gx} y1={TOP_PAD} x2={gx} y2={BAR_BOTTOM}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />
              )}

              {/* Barra Entrou */}
              {inH > 0 && (
                <path
                  d={barPath(inX, inY, BAR_W, inH || 2, BAR_RADIUS)}
                  fill="url(#fc-grad-in)"
                  filter="url(#fc-glow-in)"
                  data-value={month.in}
                />
              )}
              {inH === 0 && (
                <rect x={inX} y={BAR_BOTTOM - 2} width={BAR_W} height={2}
                  rx="1" fill="rgba(255,255,255,0.1)" />
              )}

              {/* Barra Saiu */}
              {outH > 0 && (
                <path
                  d={barPath(outX, outY, BAR_W, outH || 2, BAR_RADIUS)}
                  fill="url(#fc-grad-out)"
                  filter="url(#fc-glow-out)"
                  data-value={month.out}
                />
              )}
              {outH === 0 && (
                <rect x={outX} y={BAR_BOTTOM - 2} width={BAR_W} height={2}
                  rx="1" fill="rgba(255,255,255,0.1)" />
              )}

              {/* Label valor Entrou */}
              {month.in > 0 && (
                <text
                  x={inX + BAR_W / 2}
                  y={inY - 6}
                  textAnchor="middle"
                  className="flow-chart-value flow-chart-value--in"
                >
                  {chartMoney(month.in)}
                </text>
              )}

              {/* Label valor Saiu */}
              {month.out > 0 && (
                <text
                  x={outX + BAR_W / 2}
                  y={outY - 6}
                  textAnchor="middle"
                  className="flow-chart-value flow-chart-value--out"
                >
                  {chartMoney(month.out)}
                </text>
              )}

              {/* Label mês */}
              <text
                x={gx + GROUP_W / 2}
                y={BAR_BOTTOM + 20}
                textAnchor="middle"
                className="flow-chart-month"
              >
                {month.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
