import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import styles from './SectionRail.module.css'

const LINKS = [
  ['#top', 'Top'],
  ['#treatments', 'Treatments'],
  ['#expertise', 'Atlas'],
  ['#advice', 'Guide'],
  ['#philosophy', 'Philosophy'],
  ['#journey', 'Journey'],
  ['#research', 'Research'],
  ['#voices', 'Voices'],
  ['#gallery', 'Gallery'],
  ['#faq', 'FAQ'],
]

export default function SectionRail() {
  const [active, setActive] = useState('#top')
  const { pathname } = useLocation()
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
      {LINKS.map(([href, label]) => (
        <a key={href} href={href} className={`${styles.link}${active === href ? ' ' + styles.active : ''}`}>
          <span className={styles.lbl}>{label}</span>
          <span className={styles.pip}/>
        </a>
      ))}
    </motion.nav>
  )
}
