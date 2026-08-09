import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from '../lib/ContentProvider'
import styles from './Navbar.module.css'

const SECTION_LINKS_FALLBACK = [
  { url: '#expertise', label: 'Expertise' },
  { url: '#advice', label: 'Patient Guide' },
  { url: '#journey', label: 'Journey' },
  { url: '#voices', label: 'Voices' },
]
const PAGE_LINKS_FALLBACK = [
  { url: '/blog', label: 'Blog' },
  { url: '/about', label: 'About' },
]
const SOCIAL_FALLBACK = [
  { platform: 'linkedin', url: 'https://linkedin.com' },
  { platform: 'instagram', url: 'https://instagram.com/drnaman.uro' },
  { platform: 'youtube', url: 'https://youtube.com' },
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

const PLATFORM_ICON = { linkedin: LinkedInIcon, instagram: InstagramIcon, youtube: YouTubeIcon }
const PLATFORM_LABEL = { linkedin: 'LinkedIn', instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', x: 'X' }

function SocialIcons({ className, social }) {
  return (
    <div className={`${styles.socials} ${className || ''}`}>
      {social.map(s => {
        const Icon = PLATFORM_ICON[s.platform] || LinkedInIcon
        return (
          <a key={s.platform + s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label || PLATFORM_LABEL[s.platform] || 'Social link'} className={styles.socialLink}>
            <Icon/>
          </a>
        )
      })}
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { site } = useContent()
  const isHome = pathname === '/'
  const close = () => setOpen(false)

  const nav = site?.navigation || {}
  const SECTION_LINKS = nav.sectionLinks?.length ? nav.sectionLinks : SECTION_LINKS_FALLBACK
  const PAGE_LINKS = nav.pageLinks?.length ? nav.pageLinks : PAGE_LINKS_FALLBACK
  const social = (site?.settings?.social?.filter(s => s.visible !== false)) || SOCIAL_FALLBACK
  const ctaLabel = nav.headerCtaLabel || 'Book a consultation'
  const ctaUrl = nav.headerCtaUrl

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
            {isHome && SECTION_LINKS.map(l => (
              <a key={l.url} href={l.url}>{l.label}</a>
            ))}
            {PAGE_LINKS.map(l => (
              <Link key={l.url} to={l.url}>{l.label}</Link>
            ))}
            <SocialIcons social={social}/>
          </div>
          <Link className={`btn btn-primary ${styles.navCta}`} to={ctaUrl || (isHome ? '/#contact' : '/contact')}>{ctaLabel}</Link>
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
              {isHome && SECTION_LINKS.map((l, i) => (
                <motion.a
                  key={l.url}
                  href={l.url}
                  onClick={close}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {l.label}
                </motion.a>
              ))}
              {PAGE_LINKS.map((l, i) => (
                <motion.div key={l.url}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (isHome ? SECTION_LINKS.length : 0) * 0.06 + i * 0.06 + 0.1, duration: 0.35 }}
                >
                  <Link className={styles.mobilePageLink} to={l.url} onClick={close}>{l.label}</Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: allLinks.length * 0.06 + 0.1, duration: 0.35 }}
              >
                <Link className={`btn btn-primary ${styles.mobileCtaBtn}`} to={ctaUrl || (isHome ? '/#contact' : '/contact')} onClick={close}>
                  {ctaLabel}
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: allLinks.length * 0.06 + 0.22 }}
              >
                <SocialIcons className={styles.mobileSocials} social={social}/>
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
