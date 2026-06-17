// StatusPill: badge colorido para status da transação.
// Props: status (string), className (extra classes para as classes do benchmark)
export default function StatusPill({ status, className = '' }) {
  return (
    <span className={`status-pill status-${status}${className ? ` ${className}` : ''}`} data-value={status}>
      {status}
    </span>
  )
}
