import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
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
            Whether you are a patient seeking relief, a family weighing surgery, or a physician seeking a referral — Dr. Aggarwal's clinic at Manipal Hospital, Dwarka is open to you.
          </motion.p>
          <motion.div className={styles.ctaRow} variants={fadeUp}>
            <Link className="btn btn-light" to="/contact" data-magnetic="0.3">
              Request an appointment <span className="arr">→</span>
            </Link>
          </motion.div>
        </div>
        <motion.div className={styles.side} variants={fadeUp}>
          {[['Hospital','Manipal Hospital, Dwarka, Delhi'],['Speciality','Urology · Andrology · Laparoscopy'],['Languages','English · Hindi']].map(([k, v]) => (
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
