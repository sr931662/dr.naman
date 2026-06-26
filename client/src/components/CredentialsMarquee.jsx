import { motion } from 'framer-motion'
import styles from './CredentialsMarquee.module.css'

const Items = () => (
  <div className={styles.item}>
    <span className={styles.m}><b>Manipal Hospital</b> · Dwarka, Delhi</span><span className={styles.star}>✦</span>
    <span className={styles.m}>American Society for <b>Reproductive Medicine</b></span><span className={styles.star}>✦</span>
    <span className={styles.m}><b>First IVF</b>, Dubai · Observership</span><span className={styles.star}>✦</span>
    <span className={styles.m}><b>Devon</b> Traveling Fellowship</span><span className={styles.star}>✦</span>
    <span className={styles.m}>Speaker · <b>SIU · UAA · USICON</b></span><span className={styles.star}>✦</span>
  </div>
)

export default function CredentialsMarquee() {
  return (
    <motion.section
      className={styles.marquee}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.track}>
        <Items/><Items/>
      </div>
    </motion.section>
  )
}
