import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Navbar.module.css'

const LINKS = [
  ['#expertise', 'Expertise'], ['#philosophy', 'Philosophy'],
  ['#journey', 'Journey'], ['#voices', 'Voices'], ['#contact', 'Contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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
          <a className={styles.brand} href="#top" onClick={close}>
            <span className={styles.brandMono}>N</span>
            <span className={styles.brandName}>
              Dr. Naman Aggarwal
              <small>Urology · Transplant</small>
            </span>
          </a>
          <div className={styles.navLinks}>
            {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </div>
          <a className={`btn btn-primary ${styles.navCta}`} href="#contact">Book a consultation</a>
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
              {LINKS.map(([href, label], i) => (
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
              <motion.a
                className="btn btn-primary"
                href="#contact"
                onClick={close}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: LINKS.length * 0.06 + 0.1, duration: 0.35 }}
              >
                Book a consultation
              </motion.a>
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
