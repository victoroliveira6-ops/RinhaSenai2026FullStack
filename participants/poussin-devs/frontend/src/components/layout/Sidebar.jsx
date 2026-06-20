import { NavLink } from 'react-router'
import { LayoutDashboard, History, Settings, ArrowLeftRight } from 'lucide-react'
import { USER_NAME, initials } from '../../config.js'

const USER_INITIALS = initials(USER_NAME)

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Menu lateral">
      <div className="sidebar-header">
        <span className="sidebar-brand">Rinha Pay</span>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
          }
        >
          <LayoutDashboard size={17} aria-hidden="true" className="sidebar-link-icon" />
          <span className="sidebar-link-label">Dashboard</span>
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
          }
        >
          <History size={17} aria-hidden="true" className="sidebar-link-icon" />
          <span className="sidebar-link-label">Histórico</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {/* Placeholder visual — sem funcionalidade real. Produto não tem autenticação
            nem múltiplas contas nesta fase. Não adicionar onClick aqui. */}
        <button
          className="sidebar-link sidebar-settings-btn"
          type="button"
          aria-label="Configurações (em breve)"
        >
          <Settings size={17} aria-hidden="true" />
          Configurações
        </button>

        {/* Placeholder visual — sem funcionalidade real. Produto não tem autenticação
            nem múltiplas contas nesta fase. Não adicionar onClick aqui. */}
        <div className="sidebar-profile">
          <div className="profile-avatar" aria-hidden="true">{USER_INITIALS}</div>
          <span className="profile-name">{USER_NAME}</span>
          <button
            className="profile-switch-btn"
            type="button"
            aria-label="Trocar perfil (em breve)"
          >
            <ArrowLeftRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
