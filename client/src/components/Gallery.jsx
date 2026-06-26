import { motion } from 'framer-motion'
import styles from './Gallery.module.css'

const ITEMS = [
  {
    label: 'Consultation Suite · Medanta',
    sublabel: 'Private · First Floor',
    gradient: 'linear-gradient(135deg, #1a0a0e 0%, #3d1020 50%, #5c1a30 100%)',
    tall: true,
  },
  {
    label: 'Robotic Theatre',
    sublabel: 'Da Vinci Xi · Suite 4',
    gradient: 'linear-gradient(150deg, #0d0d14 0%, #1a1a2e 50%, #16213e 100%)',
    tall: false,
  },
  {
    label: 'Patient Recovery',
    sublabel: 'Post-Procedure Care',
    gradient: 'linear-gradient(120deg, #0f1a12 0%, #1a2f1e 50%, #2a4a2e 100%)',
    tall: false,
  },
  {
    label: 'Medanta Campus',
    sublabel: 'Sector 38, Gurugram',
    gradient: 'linear-gradient(160deg, #1a1410 0%, #2e2218 50%, #3d2f20 100%)',
    tall: false,
    wide: true,
  },
  {
    label: 'Surgical Precision',
    sublabel: 'Minimally Invasive',
    gradient: 'linear-gradient(135deg, #1a0a0e 0%, #2e0f1c 50%, #4a1428 100%)',
    tall: false,
    wide: true,
  },
  {
    label: 'Post-Transplant Care',
    sublabel: 'Nephrology + Urology',
    gradient: 'linear-gradient(145deg, #0e1218 0%, #192030 50%, #243040 100%)',
    tall: false,
  },
]

function MedicalPattern({ id }) {
  return (
    <svg className={styles.pattern} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <pattern id={`p${id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,.06)"/>
          <line x1="20" y1="8" x2="20" y2="32" stroke="rgba(255,255,255,.04)" strokeWidth="0.5"/>
          <line x1="8" y1="20" x2="32" y2="20" stroke="rgba(255,255,255,.04)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#p${id})`}/>
      <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,.04)" strokeWidth="0.5" fill="none"/>
      <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,.03)" strokeWidth="0.5" fill="none"/>
    </svg>
  )
}

export default function Gallery() {
  return (
    <section className={styles.section} id="gallery">
      <div className="wrap">
        <motion.div
          className={styles.head}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">The Practice</span>
          <h2>Where care <em>happens</em></h2>
          <p className="lead">World-class facilities at Medanta — one of India&#39;s most advanced multi-specialty hospitals.</p>
        </motion.div>

        <div className={styles.grid}>
          {ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className={`${styles.item} ${item.tall ? styles.tall : ''} ${item.wide ? styles.wide : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.visual} style={{ background: item.gradient }}>
                <MedicalPattern id={i}/>
                <div className={styles.shimmer}/>
              </div>
              <div className={styles.overlay}>
                <div className={styles.itemLabel}>
                  <span className={styles.sublabel}>{item.sublabel}</span>
                  <span className={styles.mainLabel}>{item.label}</span>
                </div>
                <div className={styles.corner}/>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
