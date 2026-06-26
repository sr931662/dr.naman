import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './About.module.css'

const TIMELINE = [
  { year: '2010–2015', title: 'MBBS — Maulana Azad Medical College', sub: 'University of Delhi · Top 5% of graduating class', icon: '🎓' },
  { year: '2015–2019', title: 'MS General Surgery — AIIMS New Delhi', sub: 'All India Institute of Medical Sciences · Distinction', icon: '🔬' },
  { year: '2019–2022', title: 'MCh Urology / Genito-Urinary Surgery', sub: 'Masters of Chirurgiae — Urology & Genito-Urinary Surgery', icon: '⚕' },
  { year: '2022', title: 'Devon Fellowship — United Kingdom', sub: 'Advanced laparoscopic & robotic urological surgery', icon: '🌍' },
  { year: '2023', title: 'ASRM Andrology Certification', sub: 'American Society for Reproductive Medicine', icon: '🏆' },
  { year: '2023', title: 'Observership — First IVF, Dubai', sub: 'Advanced male fertility & microsurgical techniques', icon: '✦' },
  { year: 'Present', title: 'Consultant — Manipal Hospital, Dwarka, Delhi', sub: 'Urology · Andrology · Laparoscopic Surgery · 11 yrs experience', icon: '♥' },
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
    text: 'Protocols evolve. Published research is read weekly, not annually. Patients at Manipal Hospital benefit from techniques that reflect the current state of urological science, not the state it was in five years ago.',
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
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Consultant Urologist · Manipal Hospital, Dwarka, Delhi</span>
              <h1 className={styles.heroH1}>Dr. Naman <em>Aggarwal</em></h1>
              <p className={styles.heroPhilo}>Surgical precision, profoundly human care.</p>
              <p className={styles.heroLead}>
                MBBS · MS General Surgery · MCh Urology. Urologist, Andrologist &amp; Laparoscopic Surgeon with 11 years of experience — bringing rigorous, evidence-based technique to every patient at Manipal Hospital, Dwarka, Delhi.
              </p>
              <div className={styles.heroActions}>
                <Link to="/contact" className="btn btn-primary">Book a consultation</Link>
                <a href="#journey" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}>
                  Explore journey <span className="arr">→</span>
                </a>
              </div>
            </motion.div>
            <motion.div className={styles.heroStats} {...fadeUp(0.25)}>
              {[['11 yrs', 'Experience'],['ASRM', 'Andrology certified'],['Devon', '2022 Fellowship'],['Manipal', 'Dwarka, Delhi']].map(([val, label]) => (
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

      {/* Manipal Hospital section */}
      <section className={styles.medantaSection}>
        <div className="wrap">
          <div className={styles.medantaGrid}>
            <motion.div {...fadeUp()}>
              <span className="eyebrow">The Hospital</span>
              <h2>Manipal Hospital — <em>Dwarka, Delhi</em></h2>
              <p className="lead" style={{ marginTop: 20 }}>
                Manipal Hospital, Dwarka is a leading multi-specialty hospital in West Delhi — equipped with advanced surgical suites, diagnostic infrastructure, and a dedicated urology &amp; andrology department.
              </p>
              <p style={{ color: 'var(--ink-soft)', marginTop: 16, lineHeight: 1.65 }}>
                Dr. Aggarwal practices across urology, andrology, and minimally-invasive laparoscopic surgery here. The department handles the full spectrum — from stone disease and BPH to male fertility and complex laparoscopic procedures.
              </p>
              <div className={styles.medantaMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Address</span>
                  <span className={styles.metaVal}>Palam Vihar Colony, Sector 6, Dwarka, Delhi (Near MTNL Office)</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>OPD Schedule</span>
                  <span className={styles.metaVal}>Tue &amp; Sat: 9:00 AM – 3:00 PM · Wed–Thu: 11:00 AM – 3:00 PM</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Consultation Fee</span>
                  <span className={styles.metaVal}>₹1500 · No booking fee · Prime verified</span>
                </div>
              </div>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: 28 }}>Get directions &amp; book</Link>
            </motion.div>
            <motion.div className={styles.medantaMap} {...fadeUp(0.15)}>
              <div className={styles.mapPlaceholder}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.151058565209!2d77.06684367614186!3d28.595244775685092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b3ae0cf4f6f%3A0xec55552f03c1526d!2sManipal%20Hospital%20Delhi!5e0!3m2!1sen!2sin!4v1782467063048!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Manipal Hospital Dwarka, Delhi"
                />
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
            <p className="lead">Book an appointment at Manipal Hospital, Dwarka, or reach out for a teleconsultation.</p>
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
