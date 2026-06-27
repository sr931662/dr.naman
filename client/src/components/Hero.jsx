import { motion } from 'framer-motion'
import drNaman from '../assets/Dr__Naman.png'
import uaeFlag from '../assets/UAE.svg'
import usaFlag from '../assets/USA.png'
import styles from './Hero.module.css'

const WORDS = ['Surgical', 'precision,', 'profoundly', 'human', 'care.']

export default function Hero() {
  return (
    <header className={styles.hero} id="top">
      <div className={styles.aura}/>
      <svg className={styles.ring} viewBox="0 0 520 520">
        <circle cx="260" cy="260" r="258"/>
        <circle cx="260" cy="260" r="210"/>
        <line className="tick" x1="260" y1="2" x2="260" y2="20"/>
        <line className="tick" x1="260" y1="500" x2="260" y2="518"/>
        <line className="tick" x1="2" y1="260" x2="20" y2="260"/>
        <line className="tick" x1="500" y1="260" x2="518" y2="260"/>
      </svg>
      <div className={styles.photo}>
        <motion.img
          src={drNaman}
          alt="Dr. Naman Aggarwal — Consultant Urologist at Manipal Hospital Dwarka Delhi"
          loading="eager"
          fetchPriority="high"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 2.0 }}
        />
      </div>
      <div className={styles.fade}/>
      <div className={styles.measure}>
        <div className={styles.measureTrack}>
          <span className={styles.ml}>EST · MANIPAL · DELHI</span>
          <span className={styles.ml}>N · A · 28.59°N 77.05°E</span>
        </div>
      </div>
      <div className={`wrap ${styles.heroWrap}`}>
        <div className={styles.content}>
          <div className={styles.copy}>
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 2.1 }}
            >
              <span className={styles.pulse}/>
              Urology · Andrology · Uro-oncology · Renal Transplant
            </motion.span>
            <h1 className={styles.h1}>
              {WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  className={styles.word}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 2.15 + i * 0.09 }}
                >
                  {i === 3 ? <em>{word}</em> : word}{i < WORDS.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className={`lead ${styles.lead}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
            >
              Consultant Urologist, Andrologist &amp; Laparoscopic Surgeon at Manipal Hospital, Dwarka, Delhi — uniting minimally-invasive technique with a calm, deeply personal bedside that patients remember long after they heal.
            </motion.p>
            <motion.div
              className={styles.cta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 2.65 }}
            >
              <a className="btn btn-primary" href="#contact">Book a consultation</a>
              <a className="btn btn-ghost" href="#expertise">Enter the Atlas <span className="arr">→</span></a>
            </motion.div>
            <motion.div
              className={styles.stats}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 2.8 }}
            >
              <div className={styles.stat}>
                <b>1,000+</b><span>Patients treated</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statFlag}>
                  <img src={usaFlag} alt="USA" className={styles.flagImg}/>
                </b>
                <span>ASRM · Andrology</span>
              </div>
              {[['MCh','Urology · Delhi']].map(([val, label]) => (
                <div key={label} className={styles.stat}>
                  <b>{val}</b><span>{label}</span>
                </div>
              ))}
              <div className={styles.stat}>
                <b className={styles.statFlag}>
                  <img src={uaeFlag} alt="UAE" className={styles.flagImg}/>
                </b>
                <span>Dubai · Fellowship</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className={styles.scrollcue}>Scroll<i/></div>
    </header>
  )
}
