import { motion } from 'framer-motion'
import styles from './Footer.module.css'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }

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
        </motion.div>
        {[
          ['Practice', [['#expertise','Urology'],['#expertise','Andrology'],['#expertise','Uro-oncology'],['#expertise','Renal Transplant']]],
          ['Explore', [['#philosophy','Philosophy'],['#journey','Journey'],['#research','Research'],['#voices','Voices']]],
          ['Clinic', [['#contact','Book a consultation'],['#contact','Medanta, Gurugram'],['#contact','Referrals']]],
        ].map(([heading, links]) => (
          <motion.div key={heading} className={styles.col} variants={fadeUp}>
            <h5>{heading}</h5>
            {links.map(([href, label]) => <a key={label} href={href}>{label}</a>)}
          </motion.div>
        ))}
      </motion.div>
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© 2026 Dr. Naman Aggarwal</span>
          <span>Medanta — The Medicity · Gurugram, India</span>
        </div>
      </div>
    </footer>
  )
}
