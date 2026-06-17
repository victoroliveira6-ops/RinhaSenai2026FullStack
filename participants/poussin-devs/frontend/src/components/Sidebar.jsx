// Sidebar: âncora visual fixa — sem glass/backdrop-filter para não competir com o conteúdo.
import { NavLink } from 'react-router'
import { useAppData } from '../context/AppDataContext.jsx'
import { money } from '../utils/format.js'

export default function Sidebar() {
  const { balance, isOnline } = useAppData()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">RP</span>
        <span className="sidebar-name">Rinha Pay</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          Histórico
        </NavLink>
      </nav>
      <div className="sidebar-balance">
        <p className="sidebar-balance-label">Saldo Líquido</p>
        <p className="sidebar-balance-value">{money(balance.balance_cents)}</p>
        <span className={`online-dot${isOnline ? ' online' : ''}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </aside>
  )
}
