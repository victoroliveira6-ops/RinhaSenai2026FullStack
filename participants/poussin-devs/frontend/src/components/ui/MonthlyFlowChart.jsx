const GROUP_W = 140
const BAR_W = 42
const BAR_GAP = 8
const TOP_PAD = 26
const MAX_BAR_H = 130
const BAR_BOTTOM = TOP_PAD + MAX_BAR_H  // 156
const SVG_H = TOP_PAD + MAX_BAR_H + 26  // 182
const IN_OFF = (GROUP_W - BAR_W * 2 - BAR_GAP) / 2  // 24
const OUT_OFF = IN_OFF + BAR_W + BAR_GAP             // 74

function chartMoney(cents) {
  const reais = cents / 100
  if (reais < 1000) return `R$${Math.round(reais)}`
  return `R$${(reais / 1000).toFixed(1).replace('.', ',')}k`
}

export default function MonthlyFlowChart({ data }) {
  const svgW = GROUP_W * data.length
  const maxVal = Math.max(...data.flatMap(m => [m.in, m.out]), 1)

  return (
    <div className="flow-chart">
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
      >
        {data.map((month, gi) => {
          const gx = gi * GROUP_W
          const inH = Math.round((month.in / maxVal) * MAX_BAR_H)
          const outH = Math.round((month.out / maxVal) * MAX_BAR_H)
          const inX = gx + IN_OFF
          const outX = gx + OUT_OFF

          return (
            <g key={month.label}>
              <rect
                x={inX}
                y={inH === 0 ? BAR_BOTTOM - 2 : BAR_BOTTOM - inH}
                width={BAR_W}
                height={inH === 0 ? 2 : inH}
                rx="3"
                style={{ fill: inH === 0 ? 'var(--border-strong)' : 'var(--approved)' }}
                data-value={month.in}
              />
              <rect
                x={outX}
                y={outH === 0 ? BAR_BOTTOM - 2 : BAR_BOTTOM - outH}
                width={BAR_W}
                height={outH === 0 ? 2 : outH}
                rx="3"
                style={{ fill: outH === 0 ? 'var(--border-strong)' : 'var(--declined)' }}
                data-value={month.out}
              />
              {month.in > 0 && (
                <text
                  x={inX + BAR_W / 2}
                  y={BAR_BOTTOM - inH - 5}
                  textAnchor="middle"
                  className="flow-chart-value flow-chart-value--in"
                >
                  {chartMoney(month.in)}
                </text>
              )}
              {month.out > 0 && (
                <text
                  x={outX + BAR_W / 2}
                  y={BAR_BOTTOM - outH - 5}
                  textAnchor="middle"
                  className="flow-chart-value flow-chart-value--out"
                >
                  {chartMoney(month.out)}
                </text>
              )}
              <text
                x={gx + GROUP_W / 2}
                y={BAR_BOTTOM + 18}
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
