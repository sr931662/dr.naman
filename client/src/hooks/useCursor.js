import { useEffect } from 'react'

export function useCursor() {
  useEffect(() => {
    const ring = document.querySelector('.cursor-ring')
    const dot = document.querySelector('.cursor-dot')
    if (!ring || !dot) return

    let rx = 0, ry = 0, dx = 0, dy = 0
    let raf

    const onMove = (e) => {
      dx = e.clientX
      dy = e.clientY
    }

    const tick = () => {
      rx += (dx - rx) * 0.12
      ry += (dy - ry) * 0.12
      ring.style.transform = `translate(${rx - 18}px,${ry - 18}px)`
      dot.style.transform = `translate(${dx - 4}px,${dy - 4}px)`
      raf = requestAnimationFrame(tick)
    }

    const onEnter = () => {
      ring.style.opacity = '1'
      dot.style.opacity = '1'
    }
    const onLeave = () => {
      ring.style.opacity = '0'
      dot.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseenter', onEnter)
    document.documentElement.addEventListener('mouseleave', onLeave)

    // hot state for interactive elements
    const addHot = (e) => e.currentTarget.closest('[data-magnetic]') || e.currentTarget.tagName === 'A' || e.currentTarget.tagName === 'BUTTON'
      ? ring.classList.add('hot') : null
    const removeHot = () => ring.classList.remove('hot')

    document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hot'))
      el.addEventListener('mouseleave', removeHot)
    })

    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])
}
