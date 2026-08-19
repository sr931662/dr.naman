import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import styles from './About.module.css'

const TIMELINE = [
  { year: '2010–2015', title: 'MBBS — Maulana Azad Medical College', sub: 'University of Delhi · Top 5% of graduating class' },
  { year: '2015–2019', title: 'MS General Surgery — AIIMS New Delhi', sub: 'All India Institute of Medical Sciences · Distinction' },
  { year: '2019–2022', title: 'MCh Urology / Genito-Urinary Surgery', sub: 'Masters of Chirurgiae — Urology & Genito-Urinary Surgery' },
  { year: '2022', title: 'Devon Fellowship — United Kingdom', sub: 'Advanced laparoscopic & robotic urological surgery' },
  { year: '2023', title: 'ASRM Andrology Certification', sub: 'American Society for Reproductive Medicine' },
  { year: '2023', title: 'Observership — First IVF, Dubai', sub: 'Advanced male fertility & microsurgical techniques' },
  { year: 'Present', title: 'Consultant Urologist — Delhi', sub: 'Urology · Andrology · Laparoscopic Surgery · 11 yrs experience' },
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
    text: 'Protocols evolve. Published research is read weekly, not annually. Patients benefit from techniques that reflect the current state of urological science, not the state it was in five years ago.',
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
      <Seo
        title="About Dr. Naman Aggarwal"
        description="MBBS, MS General Surgery, MCh Urology (PGIMER) · Devon Fellow (UK) · ASRM Certified. 11 years of experience in urology, andrology & laparoscopic surgery across Delhi."
        path="/about"
      />
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}/>
        <div className="wrap">
          <div className={styles.heroContent}>
            <motion.div className={styles.heroCopy} {...fadeUp(0.1)}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Consultant Urologist · Delhi</span>
              <h1 className={styles.heroH1}>Dr. Naman <em>Aggarwal</em></h1>
              <p className={styles.heroPhilo}>Surgical precision, profoundly human care.</p>
              <p className={styles.heroLead}>
                MBBS · MS General Surgery · MCh Urology. Urologist, Andrologist &amp; Laparoscopic Surgeon with 11 years of experience — bringing rigorous, evidence-based technique to every patient across Delhi.
              </p>
              <div className={styles.heroActions}>
                <Link to="/contact" className="btn btn-primary">Book a consultation</Link>
                <a href="#journey" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}>
                  Explore journey <span className="arr">→</span>
                </a>
              </div>
            </motion.div>
            <motion.div className={styles.heroStats} {...fadeUp(0.25)}>
              {[['11 yrs', 'Experience'],['ASRM', 'Andrology certified'],['Devon', '2022 Fellowship'],['3', 'Locations in Delhi']].map(([val, label]) => (
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

      {/* Where to find him */}
      <section className={styles.medantaSection}>
        <div className="wrap">
          <motion.div className={styles.sHead} {...fadeUp()}>
            <span className="eyebrow">Where to Find Him</span>
            <h2>Practising across <em>Delhi</em></h2>
          </motion.div>
          <p className="lead" style={{ marginTop: 20, maxWidth: 700 }}>
            Dr. Aggarwal's main clinic is Men's Health Corner, with additional OPD hours at Manipal Hospital, Dwarka and Veena Nursing Home — all handling the full spectrum of urological and andrological care, from stone disease and BPH to male fertility and minimally-invasive laparoscopic procedures. Full addresses, hours and fees are on the <Link to="/contact" style={{ color: 'var(--crimson)' }}>contact page</Link>.
          </p>
          <div className={styles.clinicGrid}>
            {[
              { name: "Men's Health Corner", desc: "Dr. Aggarwal's main clinic for urology, andrology and men's health consultations." },
              { name: 'Manipal Hospital, Dwarka', desc: 'Multi-specialty hospital OPD — Tue, Wed, Thu & Sat.' },
              { name: 'Veena Nursing Home', desc: 'Early morning and evening OPD slots for urological and andrological care.' },
            ].map((c, i) => (
              <motion.div key={c.name} className={styles.clinicCard} {...fadeUp(0.1 + i * 0.08)}>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
                <Link to="/contact" className="btn btn-ghost">Get directions &amp; book <span className="arr">→</span></Link>
              </motion.div>
            ))}
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
            <p className="lead">Book an appointment at Men's Health Corner, Manipal Hospital or Veena Nursing Home, or reach out for a teleconsultation.</p>
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
