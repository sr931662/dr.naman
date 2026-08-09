import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/ContentProvider'
import drNaman from '../assets/Dr__Naman.jpg'
import uaeFlag from '../assets/UAE.svg'
import usaFlag from '../assets/USA.svg'
import styles from './Hero.module.css'

const WORDS_FALLBACK = ['Surgical', 'precision,', 'profoundly', 'human', 'care.']
const EYEBROW_FALLBACK = 'Urology · Andrology · Uro-oncology · Renal Transplant'
const SUBHEADING_FALLBACK = 'Consultant Urologist, Andrologist & Laparoscopic Surgeon at Manipal Hospital, Dwarka, Delhi — uniting minimally-invasive technique with a calm, deeply personal bedside that patients remember long after they heal.'
const CTAS_FALLBACK = [
  { label: 'Book a consultation', url: '/contact', variant: 'primary' },
  { label: 'Enter the Atlas', url: '#expertise', variant: 'ghost' },
]
/** The USA/UAE flag badges are a code-level embellishment the CMS stat schema
 * (plain value + label) doesn't model — kept only for the fallback so the hero
 * still looks right before the CMS has stats configured. */
const STATS_FALLBACK_RICH = [
  { value: '1,000+', label: 'Patients treated' },
  { flag: usaFlag, flagAlt: 'USA', label: 'ASRM · Andrology' },
  { value: 'Laser', label: 'Kidney Stone Surgeon' },
  { flag: uaeFlag, flagAlt: 'UAE', label: 'Dubai · Fellowship' },
]

export default function Hero() {
  const { home } = useContent()
  const hero = home?.hero
  const WORDS = hero?.headlineWords?.length ? hero.headlineWords : WORDS_FALLBACK
  const eyebrow = hero?.eyebrow || EYEBROW_FALLBACK
  const subheading = hero?.subheading || SUBHEADING_FALLBACK
  const ctas = hero?.ctas?.length ? hero.ctas : CTAS_FALLBACK
  const image = hero?.image?.url ? hero.image : null
  const stats = hero?.stats?.length ? hero.stats : null

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
          src={image?.url || drNaman}
          alt={image?.alt || 'Dr. Naman Aggarwal — Consultant Urologist at Manipal Hospital Dwarka Delhi'}
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
              {eyebrow}
            </motion.span>
            <h1 className={styles.h1}>
              <span className="visually-hidden">Dr. Naman Aggarwal — Urologist, Andrologist &amp; Laparoscopic Surgeon in Dwarka, Delhi. </span>
              {WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  className={styles.word}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 2.15 + i * 0.09 }}
                >
                  {i === 3 && WORDS.length === 5 ? <em>{word}</em> : word}{i < WORDS.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className={`lead ${styles.lead}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
            >
              {subheading}
            </motion.p>
            <motion.div
              className={styles.cta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 2.65 }}
            >
              {ctas.map(c => (
                c.url.startsWith('/') ? (
                  <Link key={c.label} className={`btn ${c.variant === 'ghost' ? 'btn-ghost' : 'btn-primary'}`} to={c.url}>{c.label}</Link>
                ) : (
                  <a key={c.label} className={`btn ${c.variant === 'ghost' ? 'btn-ghost' : 'btn-primary'}`} href={c.url}>
                    {c.label}{c.variant === 'ghost' && <span className="arr">→</span>}
                  </a>
                )
              ))}
            </motion.div>
            <motion.div
              className={styles.stats}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 2.8 }}
            >
              {(stats || STATS_FALLBACK_RICH).map((s, i) => (
                <div key={i} className={styles.stat}>
                  {s.flag ? (
                    <b className={styles.statFlag}><img src={s.flag} alt={s.flagAlt} className={styles.flagImg}/></b>
                  ) : (
                    <b>{s.value}</b>
                  )}
                  <span>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <div className={styles.scrollcue}>Scroll<i/></div>
    </header>
  )
}
