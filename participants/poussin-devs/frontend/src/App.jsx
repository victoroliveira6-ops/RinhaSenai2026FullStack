import { createPortal } from 'react-dom'
import { Routes, Route } from 'react-router'
import { AppDataProvider } from './context/AppDataContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Detail from './pages/Detail.jsx'

function BgVideo() {
  const target = document.getElementById('bg-root')
  if (!target) return null
  return createPortal(
    <div className="app-bg" aria-hidden="true">
      <video
        className="app-bg-video"
        autoPlay muted loop playsInline
        poster="/images/app-bg-poster.webp"
      >
        <source src="/videos/0618.mp4" type="video/mp4" />
      </video>
      <div className="app-bg-scrim" />
    </div>,
    target
  )
}

export default function App() {
  return (
    <AppDataProvider>
      <BgVideo />
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <Topbar />
          <div className="page">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/transaction/:id" element={<Detail />} />
            </Routes>
          </div>
        </main>
      </div>
    </AppDataProvider>
  )
}
