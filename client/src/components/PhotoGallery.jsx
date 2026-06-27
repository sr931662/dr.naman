import { motion } from 'framer-motion'
import styles from './PhotoGallery.module.css'
import drNaman from '../assets/Dr__Naman.png'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

const CLINIC_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=800&q=80',
    label: 'OPD Consultation',
    sub: 'Manipal Hospital · Dwarka',
  },
  {
    src: 'https://images.unsplash.com/photo-1758206523711-f20bb01033a5?auto=format&fit=crop&w=800&q=80',
    label: 'Surgical Suite',
    sub: 'Minimally invasive · Laparoscopic',
  },
  {
    src: 'https://plus.unsplash.com/premium_photo-1661627109539-69d7096ea354?auto=format&fit=crop&w=800&q=80',
    label: 'Endoscopy Unit',
    sub: 'RIRS · Ureteroscopy · PCNL',
  },
  {
    src: 'https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?auto=format&fit=crop&w=800&q=80',
    label: 'Patient Care',
    sub: 'Post-operative follow-up',
  },
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

          {/* Clinic photos */}
          {CLINIC_PHOTOS.map((p, i) => (
            <motion.div key={i} className={`${styles.cell} ${styles.clinicPhoto}`} {...fadeUp(0.12 + i * 0.06)}>
              <img src={p.src} alt={p.label} className={styles.clinicImg} loading="lazy"/>
              <div className={styles.clinicCaption}>
                <span className={styles.captionName}>{p.label}</span>
                <span className={styles.captionSub}>{p.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
