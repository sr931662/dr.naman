import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const SECTION_LINKS = [
  ['#expertise', 'Expertise'],
  ['#advice', 'Patient Guide'],
  ['#journey', 'Journey'],
  ['#voices', 'Voices'],
]
const PAGE_LINKS = [
  ['/blog', 'Blog'],
  ['/about', 'About'],
]

function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 10v7M7 7v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M11 10v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M10 9.5l5 2.5-5 2.5V9.5z" fill="currentColor"/>
    </svg>
  )
}

function SocialIcons({ className }) {
  return (
    <div className={`${styles.socials} ${className || ''}`}>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.socialLink}>
        <LinkedInIcon/>
      </a>
      <a href="https://instagram.com/drnaman.uro" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
        <InstagramIcon/>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialLink}>
        <YouTubeIcon/>
      </a>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const close = () => setOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 981px)')
    const handler = (e) => { if (e.matches) close() }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const allLinks = isHome
    ? [...SECTION_LINKS, ...PAGE_LINKS]
    : PAGE_LINKS

  return (
    <>
      <motion.nav
        className={`${styles.nav}${scrolled ? ' ' + styles.scrolled : ''}`}
        id="nav"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 2.2 }}
      >
        <div className="wrap">
          <Link className={styles.brand} to="/" onClick={close}>
            <span className={styles.brandMono}>N</span>
            <span className={styles.brandName}>
              Dr. Naman Aggarwal
              <small>Urology · Transplant</small>
            </span>
          </Link>
          <div className={styles.navLinks}>
            {isHome && SECTION_LINKS.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
            {PAGE_LINKS.map(([href, label]) => (
              <Link key={href} to={href}>{label}</Link>
            ))}
            <SocialIcons/>
          </div>
          <Link className={`btn btn-primary ${styles.navCta}`} to={isHome ? '/#contact' : '/contact'}>Book a consultation</Link>
          <button
            className={`${styles.burger}${open ? ' ' + styles.burgerOpen : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span/><span/><span/>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {isHome && SECTION_LINKS.map(([href, label], i) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={close}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {label}
                </motion.a>
              ))}
              {PAGE_LINKS.map(([href, label], i) => (
                <motion.div key={href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (isHome ? SECTION_LINKS.length : 0) * 0.06 + i * 0.06 + 0.1, duration: 0.35 }}
                >
                  <Link className={styles.mobilePageLink} to={href} onClick={close}>{label}</Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: allLinks.length * 0.06 + 0.1, duration: 0.35 }}
              >
                <Link className={`btn btn-primary ${styles.mobileCtaBtn}`} to={isHome ? '/#contact' : '/contact'} onClick={close}>
                  Book a consultation
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: allLinks.length * 0.06 + 0.22 }}
              >
                <SocialIcons className={styles.mobileSocials}/>
              </motion.div>
            </motion.div>
            <motion.div
              className={styles.overlay}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
