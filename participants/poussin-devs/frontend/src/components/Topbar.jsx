// Topbar: cabeçalho de página com título, subtítulo e slot para ações.
// Props: title, subtitle, children (botões de ação)
export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="page-topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  )
}
