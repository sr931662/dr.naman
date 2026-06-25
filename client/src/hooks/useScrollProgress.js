import { useEffect } from 'react'

export function useScrollProgress() {
  useEffect(() => {
    const bar = document.querySelector('.vital-bar i')
    if (!bar) return
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      bar.style.width = `${Math.min(pct, 100)}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
