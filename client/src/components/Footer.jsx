import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/ContentProvider'
import styles from './Footer.module.css'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }

const FOOTER_COLUMNS_FALLBACK = [
  { title: 'Practice', links: [{ url: '#expertise', label: 'Urology' }, { url: '#expertise', label: 'Andrology' }, { url: '#expertise', label: 'Uro-oncology' }, { url: '#expertise', label: 'Renal Transplant' }] },
  { title: 'Explore', links: [{ url: '/about', label: 'About Dr. Aggarwal' }, { url: '/blog', label: 'Blog & Insights' }, { url: '#journey', label: 'Journey' }, { url: '#research', label: 'Research' }] },
  { title: 'Clinic', links: [{ url: '#contact', label: 'Book a consultation' }, { url: '#contact', label: 'Clinic Locations' }, { url: '#contact', label: 'Referrals' }, { url: '#contact', label: 'Teleconsultation' }] },
]
const SOCIAL_FALLBACK = [
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/andrologistdelhi/' },
  { platform: 'instagram', label: '@drnaman.uro', url: 'https://instagram.com/drnaman.uro' },
  { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@drnamanaggarwal' },
]

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 10v7M7 7v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M11 10v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M10 9.5l5 2.5-5 2.5V9.5z" fill="currentColor"/>
    </svg>
  )
}

const PLATFORM_ICON = { linkedin: LinkedInIcon, instagram: InstagramIcon, youtube: YouTubeIcon }

export default function Footer() {
  const { site } = useContent()
  const columns = site?.navigation?.footerColumns?.length ? site.navigation.footerColumns : FOOTER_COLUMNS_FALLBACK
  const social = site?.settings?.social?.filter(s => s.visible !== false)?.length
    ? site.settings.social.filter(s => s.visible !== false)
    : SOCIAL_FALLBACK
  const copyright = site?.settings?.copyright || '© 2026 Dr. Naman Aggarwal'

  return (
    <footer className={styles.footer}>
      <motion.div
        className={styles.grid}
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div className={styles.brand} variants={fadeUp}>
          <div className={styles.brandLogo}>N</div>
          <h4>Dr. Naman Aggarwal</h4>
          <p>Urologist, Kidney transplant surgeon and Men's health specialist · Delhi. More than a decade of focused practice.</p>
          <div className={styles.socialSection}>
            <p className={styles.socialLabel}>Follow &amp; Connect</p>
            <div className={styles.socialRow}>
              {social.map(s => {
                const Icon = PLATFORM_ICON[s.platform] || LinkedInIcon
                return (
                  <a key={s.platform + s.url} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialCard} aria-label={s.label || s.platform}>
                    <Icon/>
                    <span>{s.label || s.platform}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </motion.div>
        {columns.map(col => (
          <motion.div key={col.title} className={styles.col} variants={fadeUp}>
            <h5>{col.title}</h5>
            {col.links.map(l =>
              l.url.startsWith('/') ? (
                <Link key={l.label} to={l.url}>{l.label}</Link>
              ) : (
                <a key={l.label} href={l.url} target={l.external ? '_blank' : undefined} rel={l.external ? 'noopener noreferrer' : undefined}>{l.label}</a>
              )
            )}
          </motion.div>
        ))}
      </motion.div>
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>{copyright}</span>
          <span>Men's Health Corner, Manipal Hospital &amp; Veena Nursing Home, Delhi, India</span>
        </div>
      </div>
    </footer>
  )
}
