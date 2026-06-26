import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './About.module.css'

const TIMELINE = [
  { year: '2010–2015', title: 'MBBS — Maulana Azad Medical College', sub: 'University of Delhi · Top 5% of graduating class', icon: '🎓' },
  { year: '2015–2019', title: 'MS General Surgery — AIIMS New Delhi', sub: 'All India Institute of Medical Sciences · Distinction', icon: '🔬' },
  { year: '2019–2022', title: 'MCh Urology — PGIMER Chandigarh', sub: 'Post Graduate Institute of Medical Education & Research', icon: '⚕' },
  { year: '2022', title: 'Devon Fellowship — United Kingdom', sub: 'Advanced laparoscopic & robotic urological surgery', icon: '🌍' },
  { year: '2023', title: 'ASRM Andrology Certification', sub: 'American Society for Reproductive Medicine', icon: '🏆' },
  { year: '2023', title: 'Observership — First IVF, Dubai', sub: 'Advanced male fertility & microsurgical techniques', icon: '✦' },
  { year: '2023–Present', title: 'Consultant Urologist — Medanta, Gurugram', sub: 'Urology · Andrology · Uro-oncology · Renal Transplant', icon: '♥' },
]

const PILLARS = [
  {
    title: 'Precision without compromise',
    text: 'Every surgical plan begins with the smallest effective intervention. Organ preservation, minimally invasive access, and technique refinement are non-negotiable starting points.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke="var(--crimson)" strokeWidth="1.5" opacity=".4"/>
        <path d="M16 24h16M24 16v16" stroke="var(--crimson)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="4" stroke="var(--crimson)" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    title: 'Communication as treatment',
    text: 'Fear is a measurable burden on recovery. Taking the time to explain a diagnosis thoroughly — in plain language, not medical shorthand — is itself a form of care.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M8 14 h32 a3 3 0 0 1 3 3 v14 a3 3 0 0 1 -3 3 h-20 l-7 6 v-6 h-5 a3 3 0 0 1 -3 -3 v-14 a3 3 0 0 1 3 -3z" stroke="var(--crimson)" strokeWidth="1.5" opacity=".9"/>
        <path d="M16 24h16M16 30h10" stroke="var(--crimson)" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      </svg>
    )
  },
  {
    title: 'Evidence, always',
    text: 'Protocols evolve. Published research is read weekly, not annually. Patients at Medanta benefit from techniques that reflect the current state of urological science, not the state it was in five years ago.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="10" y="8" width="28" height="36" rx="3" stroke="var(--crimson)" strokeWidth="1.5" opacity=".4"/>
        <path d="M16 18h16M16 24h16M16 30h10" stroke="var(--crimson)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M33 6v6l-3-3" stroke="var(--crimson)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

export default function AboutPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}/>
        <div className="wrap">
          <div className={styles.heroContent}>
            <motion.div className={styles.heroCopy} {...fadeUp(0.1)}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Consultant Urologist · Medanta Gurugram</span>
              <h1 className={styles.heroH1}>Dr. Naman <em>Aggarwal</em></h1>
              <p className={styles.heroPhilo}>Surgical precision, profoundly human care.</p>
              <p className={styles.heroLead}>
                Urologist, Andrologist, Uro-oncologist, and Renal Transplant Surgeon. Trained at AIIMS, PGIMER, and in the United Kingdom — bringing world-class technique to every patient at Medanta, Gurugram.
              </p>
              <div className={styles.heroActions}>
                <Link to="/contact" className="btn btn-primary">Book a consultation</Link>
                <a href="#journey" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}>
                  Explore journey <span className="arr">→</span>
                </a>
              </div>
            </motion.div>
            <motion.div className={styles.heroStats} {...fadeUp(0.25)}>
              {[['4', 'Sub-specialties'],['ASRM', 'Andrology certified'],['Devon', '2022 Fellowship'],['Medanta', 'Gurugram']].map(([val, label]) => (
                <div key={label} className={styles.heroStat}>
                  <b>{val}</b>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className={styles.timelineSection} id="journey">
        <div className="wrap">
          <motion.div className={styles.sHead} {...fadeUp()}>
            <span className="eyebrow">Training &amp; Credentials</span>
            <h2>The surgeon&#39;s <em>journey</em></h2>
          </motion.div>
          <div className={styles.timeline}>
            {TIMELINE.map((t, i) => (
              <motion.div
                key={i}
                className={styles.tItem}
                {...fadeUp(i * 0.07)}
              >
                <div className={styles.tLeft}>
                  <span className={styles.tYear}>{t.year}</span>
                </div>
                <div className={styles.tLine}>
                  <div className={styles.tDot}/>
                  {i < TIMELINE.length - 1 && <div className={styles.tConnector}/>}
                </div>
                <div className={styles.tRight}>
                  <h4>{t.title}</h4>
                  <p>{t.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medanta section */}
      <section className={styles.medantaSection}>
        <div className="wrap">
          <div className={styles.medantaGrid}>
            <motion.div {...fadeUp()}>
              <span className="eyebrow">The Hospital</span>
              <h2>Medanta — <em>The Medicity</em></h2>
              <p className="lead" style={{ marginTop: 20 }}>
                One of India&#39;s largest and most advanced multi-specialty hospitals, Medanta in Gurugram is home to over 1,500 specialists, cutting-edge robotic surgery suites, and internationally accredited transplant programmes.
              </p>
              <p style={{ color: 'var(--ink-soft)', marginTop: 16, lineHeight: 1.65 }}>
                The Department of Urology & Renal Transplant at Medanta performs some of the highest-volume and most complex urological surgeries in Northern India — including robotic-assisted procedures, HoLEP for enlarged prostate, and living-donor kidney transplantation.
              </p>
              <div className={styles.medantaMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Address</span>
                  <span className={styles.metaVal}>CH Baktawar Singh Road, Sector 38, Gurugram, Haryana 122001</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>OPD Days</span>
                  <span className={styles.metaVal}>Monday – Saturday</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Teleconsultation</span>
                  <span className={styles.metaVal}>Available for out-of-Delhi patients</span>
                </div>
              </div>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: 28 }}>Get directions &amp; book</Link>
            </motion.div>
            <motion.div className={styles.medantaMap} {...fadeUp(0.15)}>
              <div className={styles.mapPlaceholder}>
                <svg viewBox="0 0 80 80" fill="none" className={styles.mapPin} aria-hidden="true">
                  <circle cx="40" cy="40" r="38" stroke="var(--crimson)" strokeWidth="1.5" opacity=".3"/>
                  <circle cx="40" cy="40" r="26" stroke="var(--crimson)" strokeWidth="1" opacity=".2"/>
                  <path d="M40 16 C32 16 26 22 26 30 C26 40 40 56 40 56 C40 56 54 40 54 30 C54 22 48 16 40 16z" fill="var(--crimson)" opacity=".9"/>
                  <circle cx="40" cy="30" r="5" fill="#fff"/>
                </svg>
                <span className={styles.mapLabel}>Medanta Hospital</span>
                <span className={styles.mapSub}>Sector 38, Gurugram</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className={styles.philoSection}>
        <div className="wrap">
          <motion.div className={styles.sHead} {...fadeUp()}>
            <span className="eyebrow">The Practice</span>
            <h2>Philosophy in <em>practice</em></h2>
          </motion.div>
          <div className={styles.pillars}>
            {PILLARS.map((p, i) => (
              <motion.div key={i} className={styles.pillar} {...fadeUp(i * 0.1)}>
                <div className={styles.pillarIcon}>{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social + CTA */}
      <section className={styles.ctaSection}>
        <div className="wrap">
          <motion.div className={styles.ctaContent} {...fadeUp()}>
            <h2>Ready to consult?</h2>
            <p className="lead">Book an appointment at Medanta, Gurugram, or reach out for a teleconsultation.</p>
            <div className={styles.ctaActions}>
              <Link to="/contact" className="btn btn-primary">Book a consultation <span className="arr">→</span></Link>
              <Link to="/blog" className="btn btn-ghost">Read the blog</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
