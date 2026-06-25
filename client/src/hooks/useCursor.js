import { useEffect } from 'react'

export function useCursor() {
  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    const ring = document.querySelector('.cursor-ring')
    const dot = document.querySelector('.cursor-dot')
    if (!ring || !dot) return

    document.body.classList.add('cursor-on')

    let rx = 0, ry = 0, dx = 0, dy = 0, started = false, raf

    const onMove = (e) => {
      dx = e.clientX
      dy = e.clientY
      if (!started) {
        started = true
        rx = dx; ry = dy
        document.body.classList.add('cursor-ready')
      }
    }

    const tick = () => {
      rx += (dx - rx) * 0.12
      ry += (dy - ry) * 0.12
      ring.style.transform = `translate(${rx - 18}px,${ry - 18}px)`
      dot.style.transform = `translate(${dx - 4}px,${dy - 4}px)`
      raf = requestAnimationFrame(tick)
    }

    const onLeave = () => document.body.classList.remove('cursor-ready')
    const onEnter = () => started && document.body.classList.add('cursor-ready')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    const removeHot = () => ring.classList.remove('hot')
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-magnetic], [data-spec]').forEach(el => {
        if (el._cursorBound) return
        el._cursorBound = true
        el.addEventListener('mouseenter', () => ring.classList.add('hot'))
        el.addEventListener('mouseleave', removeHot)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    document.querySelectorAll('a, button, [data-magnetic], [data-spec]').forEach(el => {
      el._cursorBound = true
      el.addEventListener('mouseenter', () => ring.classList.add('hot'))
      el.addEventListener('mouseleave', removeHot)
    })

    raf = requestAnimationFrame(tick)
    return () => {
      document.body.classList.remove('cursor-on', 'cursor-ready')
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])
}
