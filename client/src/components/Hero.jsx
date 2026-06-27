import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import drNaman from '../assets/Dr__Naman.png'
import uaeFlag from '../assets/UAE.svg'
import usaFlag from '../assets/USA.png'
import styles from './Hero.module.css'

const WA_NUMBER = '919999999999' // TODO: replace with Dr. Naman's WhatsApp number
const WA_MSG = encodeURIComponent("Hi Dr. Naman, I'd like to book a consultation.")
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`

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
              <Link className="btn btn-primary" to="/contact">Book a consultation</Link>
              <a className={`btn ${styles.btnWa}`} href={WA_LINK} target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
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
              <div className={styles.stat}>
                <b>Laser</b><span>Kidney Stone Surgeon</span>
              </div>
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
