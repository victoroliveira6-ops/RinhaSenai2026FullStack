import { useState, useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'

const DURATION = 600

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

export function useCountUp(target) {
  const prefersReduced = usePrefersReducedMotion()
  const [displayed, setDisplayed] = useState(0)
  const hasAnimated = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) return

    if (prefersReduced) {
      setDisplayed(target)
      hasAnimated.current = true
      return
    }

    if (hasAnimated.current) {
      setDisplayed(target)
      return
    }

    hasAnimated.current = true
    const start = performance.now()

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / DURATION, 1)
      setDisplayed(Math.round(easeOutQuart(progress) * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, prefersReduced])

  return displayed
}
