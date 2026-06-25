import { useEffect } from 'react'

export function useSectionSpy() {
  useEffect(() => {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]')
    const railLinks = document.querySelectorAll('.srail a')
    const navEl = document.getElementById('nav')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            railLinks.forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
            })
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    )
    sections.forEach(s => io.observe(s))

    const onScroll = () => {
      if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
