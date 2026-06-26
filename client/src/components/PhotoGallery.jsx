import { motion } from 'framer-motion'
import styles from './PhotoGallery.module.css'
import drNaman from '../assets/Dr__Naman.png'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

const PLACEHOLDERS = [
  { label: 'OPD Consultation', sub: 'Manipal Hospital · Dwarka' },
  { label: 'Surgical Suite', sub: 'Minimally invasive · Laparoscopic' },
  { label: 'Endoscopy Unit', sub: 'RIRS · Ureteroscopy · PCNL' },
  { label: 'Patient Care', sub: 'Post-operative follow-up' },
]

export default function PhotoGallery() {
  return (
    <section className={styles.section} id="gallery">
      <div className="wrap">
        <motion.div className={styles.head} {...fadeUp()}>
          <span className="eyebrow">In Practice</span>
          <h2>The doctor &amp; <em>the clinic</em></h2>
          <p className="lead">Eleven years of focused urological practice at Manipal Hospital, Dwarka — where precision meets patient-first care.</p>
        </motion.div>

        <div className={styles.grid}>
          {/* Doctor portrait — featured */}
          <motion.div className={`${styles.cell} ${styles.portrait}`} {...fadeUp(0.08)}>
            <img src={drNaman} alt="Dr. Naman Aggarwal — Consultant Urologist, Manipal Hospital Dwarka" className={styles.portraitImg}/>
            <div className={styles.portraitCaption}>
              <span className={styles.captionName}>Dr. Naman Aggarwal</span>
              <span className={styles.captionSub}>MCh Urology · ASRM · Manipal Hospital, Dwarka</span>
            </div>
          </motion.div>

          {/* Placeholder clinic photos */}
          {PLACEHOLDERS.map((p, i) => (
            <motion.div key={i} className={`${styles.cell} ${styles.placeholder}`} {...fadeUp(0.12 + i * 0.06)}>
              <div className={styles.placeholderInner}>
                <svg viewBox="0 0 48 48" fill="none" className={styles.phIcon} aria-hidden="true">
                  <rect x="4" y="10" width="40" height="30" rx="3" stroke="var(--crimson)" strokeWidth="1.2" opacity=".35"/>
                  <circle cx="14" cy="20" r="4" stroke="var(--crimson)" strokeWidth="1.2" opacity=".35"/>
                  <path d="M4 30 l10-8 8 6 8-10 14 12" stroke="var(--crimson)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".35"/>
                </svg>
                <span className={styles.phLabel}>{p.label}</span>
                <span className={styles.phSub}>{p.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className={styles.foot} {...fadeUp(0.4)}>
          <span className={styles.footNote}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="var(--crimson)" strokeWidth="1.1"/>
              <path d="M7 5v3M7 9.2v.3" stroke="var(--crimson)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            More clinic photos coming soon. Contact us to schedule a visit.
          </span>
        </motion.div>
      </div>
    </section>
  )
}
