import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useContent } from '../lib/ContentProvider'
import styles from './SectionRail.module.css'

const LINKS_FALLBACK = [
  { url: '#top', label: 'Top' },
  { url: '#treatments', label: 'Treatments' },
  { url: '#advice', label: 'Guide' },
  { url: '#expertise', label: 'Atlas' },
  { url: '#gallery', label: 'Gallery' },
  { url: '#philosophy', label: 'Philosophy' },
  { url: '#journey', label: 'Journey' },
  { url: '#research', label: 'Research' },
  { url: '#voices', label: 'Voices' },
  { url: '#faq', label: 'FAQ' },
]

export default function SectionRail() {
  const [active, setActive] = useState('#top')
  const { pathname } = useLocation()
  const { site } = useContent()
  const LINKS = site?.navigation?.railLinks?.length ? site.navigation.railLinks : LINKS_FALLBACK
  const isHome = pathname === '/'

  useEffect(() => {
    if (!isHome) return
    const sections = document.querySelectorAll('section[id], header[id]')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id) }),
      { rootMargin: '-40% 0px -40% 0px' }
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [isHome])

  if (!isHome) return null

  return (
    <motion.nav
      className={styles.rail}
      aria-label="Section navigation"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 3.0, ease: [0.16, 1, 0.3, 1] }}
    >
      {LINKS.map(l => (
        <a key={l.url} href={l.url} className={`${styles.link}${active === l.url ? ' ' + styles.active : ''}`}>
          <span className={styles.lbl}>{l.label}</span>
          <span className={styles.pip}/>
        </a>
      ))}
    </motion.nav>
  )
}
