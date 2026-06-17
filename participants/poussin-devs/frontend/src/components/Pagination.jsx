// Pagination: controles de paginação com todas as classes exigidas pelo benchmark.
// Props: page, totalPages, total, onPrev, onNext
export default function Pagination({ page, totalPages, total, onPrev, onNext }) {
  return (
    <div className="pagination-bar">
      <div className="pagination-meta">
        <span>Página <strong className="pagination-current" data-value={page}>{page}</strong></span>
        <span>de <strong className="pagination-pages" data-value={totalPages}>{totalPages}</strong></span>
        <span>Total: <strong className="pagination-total" data-value={total}>{total}</strong></span>
      </div>
      <button className="btn-prev-page" disabled={page <= 1} onClick={onPrev}>← Anterior</button>
      <button className="btn-next-page" disabled={page >= totalPages} onClick={onNext}>Próximo →</button>
    </div>
  )
}
