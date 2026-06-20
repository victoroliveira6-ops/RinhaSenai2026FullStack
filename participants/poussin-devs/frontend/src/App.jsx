import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { Routes, Route } from 'react-router'
import { AppDataProvider } from './context/AppDataContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Detail from './pages/Detail.jsx'

function useGlassSpotlight() {
  useEffect(() => {
    function onMove(e) {
      const cards = document.querySelectorAll('.glass-card')
      cards.forEach(card => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
        card.style.setProperty('--my', `${e.clientY - rect.top}px`)
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
}

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
  useGlassSpotlight()
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
