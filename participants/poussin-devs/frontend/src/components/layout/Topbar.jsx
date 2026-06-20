import { Link, NavLink } from 'react-router'

// Status online/offline foi movido para o widget da Sidebar.
// Topbar serve navegação no mobile (quando sidebar está oculta).
// No desktop é uma barra plana sem conteúdo visível — fundo sólido, sem backdrop-filter.
export default function Topbar() {
  return (
    <header className="topbar">
      <Link className="topbar-brand" to="/" aria-label="Rinha Pay — início">
        Rinha Pay
      </Link>
      <nav className="topbar-nav" aria-label="Navegação principal (mobile)">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/history">Histórico</NavLink>
      </nav>
    </header>
  )
}
