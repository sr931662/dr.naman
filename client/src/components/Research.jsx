import { motion } from 'framer-motion'
import { useContent } from '../lib/ContentProvider'
import styles from './Research.module.css'

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }

const TALKS_FALLBACK = [
  { title: "Invited speaker — Société Internationale d'Urologie (SIU)", meta: 'International' },
  { title: 'Speaker — Urological Association of Asia (UAA)', meta: 'International' },
  { title: 'Speaker — USICON, Urological Society of India', meta: 'National' },
  { title: 'Active participant — regional & national conferences', meta: 'Ongoing' },
]

const Conf = () => <span className={styles.conf}><b>SIU</b> · <b>UAA</b> · <b>USICON</b> · <b>KUACON</b> · </span>

export default function Research() {
  const { home } = useContent()
  const TALKS = home?.research?.length ? home.research : TALKS_FALLBACK
  return (
    <section className={styles.section} id="research">
      <div className="wrap">
        <div className={styles.top}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={`eyebrow ${styles.eyebrow}`}>On the Podium</span>
            <h2 className={styles.h2}>Research &amp; talks</h2>
          </motion.div>
          <motion.p
            className={styles.topDesc}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.13 }}
          >
            A regular voice at international and national urological forums — sharing technique, evidence and outcomes with the wider surgical community.
          </motion.p>
        </div>
        <motion.div
          className={styles.list}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          {TALKS.map((r, i) => (
            <motion.div key={r.title} className={styles.item} variants={fadeUp}>
              <span className={styles.rn}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.rt}>{r.title}</span>
              <span className={styles.rmeta}>{r.meta}</span>
            </motion.div>
          ))}
        </motion.div>
        <div className={styles.confMarquee} aria-hidden="true">
          <div className={styles.confTrack}>
            <Conf/><Conf/><Conf/>
          </div>
        </div>
      </div>
    </section>
  )
}
