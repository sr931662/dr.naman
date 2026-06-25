import { motion } from 'framer-motion'
import styles from './CTA.module.css'

const stagger = { show: { transition: { staggerChildren: 0.13 } } }
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }

export default function CTA() {
  return (
    <section className={styles.section} id="contact">
      <motion.div
        className={styles.inner}
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className={styles.main}>
          <motion.span className={`eyebrow ${styles.eyebrow}`} variants={fadeUp}>Consultations</motion.span>
          <motion.h2 variants={fadeUp}>Begin the conversation.</motion.h2>
          <motion.p variants={fadeUp}>
            Whether you are a patient, a family weighing a transplant, or a physician seeking a referral — Dr. Aggarwal's clinic at Medanta is open to you.
          </motion.p>
          <motion.div className={styles.ctaRow} variants={fadeUp}>
            <a className="btn btn-light" href="#" data-magnetic="0.3">
              Request an appointment <span className="arr">→</span>
            </a>
          </motion.div>
        </div>
        <motion.div className={styles.side} variants={fadeUp}>
          {[['Hospital','Medanta — The Medicity, Gurugram'],['Institute','Kidney & Urology Institute'],['Languages','English · Hindi · Kannada']].map(([k, v]) => (
            <div key={k} className={styles.row}>
              <small>{k}</small>
              <span>{v}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
