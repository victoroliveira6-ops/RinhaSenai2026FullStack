export default function Pagination({ page, totalPages, total, onPrev, onNext }) {
  return (
    <div className="pagination-bar">
      <div className="pagination-meta">
        <span>Página atual: <span className="pagination-current" data-value={page}>{page}</span></span>
        <span>Total páginas: <span className="pagination-pages" data-value={totalPages}>{totalPages}</span></span>
        <span>Total: <span className="pagination-total" data-value={total}>{total}</span></span>
      </div>
      <button className="btn-prev-page" disabled={page <= 1} onClick={onPrev}>Anterior</button>
      <button className="btn-next-page" disabled={page >= totalPages} onClick={onNext}>Próximo</button>
    </div>
  )
}
