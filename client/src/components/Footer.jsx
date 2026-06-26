import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }

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

export default function Footer() {
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
          <p>Consultant Urologist, Andrologist &amp; Renal Transplant Surgeon. Surgical precision, profoundly human care.</p>
          <div className={styles.socialSection}>
            <p className={styles.socialLabel}>Follow &amp; Connect</p>
            <div className={styles.socialRow}>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialCard} aria-label="LinkedIn">
                <LinkedInIcon/>
                <span>LinkedIn</span>
              </a>
              <a href="https://instagram.com/drnaman.uro" target="_blank" rel="noopener noreferrer" className={styles.socialCard} aria-label="Instagram @drnaman.uro">
                <InstagramIcon/>
                <span>@drnaman.uro</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialCard} aria-label="YouTube">
                <YouTubeIcon/>
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </motion.div>
        {[
          ['Practice', [['#expertise','Urology'],['#expertise','Andrology'],['#expertise','Uro-oncology'],['#expertise','Renal Transplant']]],
          ['Explore', [['/about','About Dr. Aggarwal'],['/blog','Blog & Insights'],['#journey','Journey'],['#research','Research']]],
          ['Clinic', [['#contact','Book a consultation'],['#contact','Medanta, Gurugram'],['#contact','Referrals'],['#contact','Teleconsultation']]],
        ].map(([heading, links]) => (
          <motion.div key={heading} className={styles.col} variants={fadeUp}>
            <h5>{heading}</h5>
            {links.map(([href, label]) =>
              href.startsWith('/') ? (
                <Link key={label} to={href}>{label}</Link>
              ) : (
                <a key={label} href={href}>{label}</a>
              )
            )}
          </motion.div>
        ))}
      </motion.div>
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© 2026 Dr. Naman Aggarwal</span>
          <span>Medanta — The Medicity · Sector 38, Gurugram, India</span>
        </div>
      </div>
    </footer>
  )
}
