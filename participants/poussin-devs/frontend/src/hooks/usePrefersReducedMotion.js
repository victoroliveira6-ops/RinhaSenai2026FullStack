import { useState, useEffect } from 'react'

// Centralised here so no component ever calls window.matchMedia directly.
// If each component did it inline, it's easy to miss one — and future
// animation prompts would have to hunt down every caller to disable them.
export function usePrefersReducedMotion() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  const [prefersReduced, setPrefersReduced] = useState(query.matches)

  useEffect(() => {
    const handler = (e) => setPrefersReduced(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
