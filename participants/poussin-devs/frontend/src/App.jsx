import { Routes, Route } from 'react-router'
import { AppDataProvider } from './context/AppDataContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Detail from './pages/Detail.jsx'

export default function App() {
  return (
    <AppDataProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main-wrapper">
          <div className="ambient-glow violet" aria-hidden="true" />
          <div className="ambient-glow magenta" aria-hidden="true" />
          <div className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/transaction/:id" element={<Detail />} />
            </Routes>
          </div>
        </div>
      </div>
    </AppDataProvider>
  )
}
