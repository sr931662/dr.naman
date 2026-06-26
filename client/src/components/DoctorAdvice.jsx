import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './DoctorAdvice.module.css'

const CONDITIONS = [
  {
    name: 'Blood in Urine',
    subtitle: 'Haematuria',
    urgency: 'Immediate',
    urgencyColor: '#b3122a',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4 C16 4 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 4 16 4z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <path d="M12 22 a5 5 0 0 0 8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    symptoms: ['Pink, red, or brown urine', 'Visible clots', 'No pain but discoloured urine', 'Burning with urination'],
    clinicalNote: 'Any blood in urine requires evaluation to rule out bladder or kidney tumour, stones, or infection. Painless haematuria is especially concerning.',
    whenToCall: 'Same day — do not wait to see if it resolves on its own.',
  },
  {
    name: 'Kidney Stones',
    subtitle: 'Nephrolithiasis',
    urgency: 'Prompt',
    urgencyColor: '#d4660a',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="14" cy="14" rx="9" ry="11" stroke="currentColor" strokeWidth="1.6" transform="rotate(-20, 14, 14)"/>
        <path d="M10 10 l4 4 l2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="22" r="4" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M20 22h4M22 20v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    symptoms: ['Severe flank or back pain', 'Pain radiating to groin', 'Nausea and vomiting', 'Frequent urge to urinate'],
    clinicalNote: 'Stone size, location, and composition determine treatment. Most <5mm pass spontaneously; larger stones or obstruction need intervention.',
    whenToCall: 'Within 24–48 hours, or immediately if fever accompanies pain (suggests infected obstruction — a urological emergency).',
  },
  {
    name: 'Enlarged Prostate',
    subtitle: 'Benign Prostatic Hyperplasia',
    urgency: 'Routine',
    urgencyColor: '#2a7a3a',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="16" cy="18" rx="10" ry="8" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M16 10 v-4M13 7 l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18 q4 3 8 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    symptoms: ['Weak or slow urine stream', 'Frequent nighttime urination', 'Difficulty starting urination', 'Feeling of incomplete emptying'],
    clinicalNote: 'BPH is very common after 50. Untreated, it can lead to bladder damage or urinary retention. HoLEP offers durable, low-retreatment relief.',
    whenToCall: 'At your next available appointment — this is an elective condition unless complete urinary retention occurs.',
  },
  {
    name: 'Male Infertility',
    subtitle: 'Andrological Evaluation',
    urgency: 'Planned',
    urgencyColor: '#1a6ea6',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="12" cy="16" r="8" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M20 8 l4 0 0 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 12 l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 16 a4 4 0 0 0 6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    symptoms: ['Unable to conceive after 12 months of trying', 'Known low sperm count', 'Hormonal abnormalities', 'History of testicular surgery or injury'],
    clinicalNote: 'Male factor contributes to 40–50% of infertility cases. Varicocele, hormonal imbalance, and obstruction are often correctable.',
    whenToCall: 'Schedule a structured andrological evaluation — the earlier, the better for treatment outcomes.',
  },
  {
    name: 'Recurring UTIs',
    subtitle: 'Urinary Tract Infections',
    urgency: 'Prompt',
    urgencyColor: '#d4660a',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M10 8 h12 v10 a6 6 0 0 1 -12 0 z" stroke="currentColor" strokeWidth="1.6" fill="none"/>
        <path d="M16 18 v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M13 26 h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="16" cy="13" r="1.5" fill="currentColor"/>
      </svg>
    ),
    symptoms: ['More than 2 UTIs in 6 months', 'Burning urination', 'Pelvic discomfort', 'Blood-tinged urine with infection'],
    clinicalNote: 'Recurrent UTIs may signal an anatomical abnormality, bladder dysfunction, or stone. Investigation prevents antibiotic resistance.',
    whenToCall: 'Book within a week of a third recurrence — bring previous culture results.',
  },
  {
    name: 'Testicular Pain / Mass',
    subtitle: 'Scrotal Pathology',
    urgency: 'Immediate',
    urgencyColor: '#b3122a',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="11" cy="20" rx="7" ry="8" stroke="currentColor" strokeWidth="1.6"/>
        <ellipse cx="21" cy="20" rx="7" ry="8" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M16 12 l-1-6a1 1 0 0 1 2 0 l-1 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    symptoms: ['Sudden severe scrotal pain', 'Painless testicular lump', 'Swelling or heaviness', 'Pain radiating to lower abdomen'],
    clinicalNote: 'Testicular torsion is a surgical emergency (6-hour window). Any new testicular lump must be evaluated urgently to exclude testicular cancer.',
    whenToCall: 'Sudden pain: Emergency Room immediately. Painless lump: within 48 hours.',
  },
]

const URGENCY_BG = {
  Immediate: 'rgba(179,18,42,.1)',
  Prompt: 'rgba(212,102,10,.1)',
  Routine: 'rgba(42,122,58,.1)',
  Planned: 'rgba(26,110,166,.1)',
}

export default function DoctorAdvice() {
  const [active, setActive] = useState(null)

  return (
    <section className={styles.section} id="advice">
      <div className="wrap">
        <motion.div
          className={styles.head}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">Know When to Seek Care</span>
          <h2>Patient <em>guidance</em></h2>
          <p className="lead">Understanding your symptoms can save time — and sometimes your health. Dr. Aggarwal&#39;s clinical guide to urological warning signs.</p>
        </motion.div>

        <div className={styles.layout}>
          <div className={styles.cards}>
            {CONDITIONS.map((c, i) => (
              <motion.button
                key={c.name}
                className={`${styles.card} ${active === i ? styles.cardActive : ''}`}
                onClick={() => setActive(active === i ? null : i)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                aria-expanded={active === i}
              >
                <div className={styles.cardTop}>
                  <div className={styles.iconWrap} style={{ color: c.urgencyColor }}>
                    {c.icon}
                  </div>
                  <div className={styles.cardInfo}>
                    <span className={styles.conditionName}>{c.name}</span>
                    <span className={styles.conditionSub}>{c.subtitle}</span>
                  </div>
                  <span
                    className={styles.urgency}
                    style={{ color: c.urgencyColor, background: URGENCY_BG[c.urgency] }}
                  >
                    {c.urgency}
                  </span>
                </div>

                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      className={styles.detail}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className={styles.detailInner}>
                        <div className={styles.symptoms}>
                          <span className={styles.detailLabel}>Warning signs</span>
                          <ul>
                            {c.symptoms.map(s => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                        <div className={styles.clinical}>
                          <span className={styles.detailLabel}>What Dr. Aggarwal looks for</span>
                          <p>{c.clinicalNote}</p>
                        </div>
                        <div className={styles.whenCall} style={{ borderColor: c.urgencyColor + '40', background: URGENCY_BG[c.urgency] }}>
                          <span className={styles.detailLabel} style={{ color: c.urgencyColor }}>When to call</span>
                          <p>{c.whenToCall}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`${styles.chevron} ${active === i ? styles.chevronOpen : ''}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            className={styles.sidebar}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className={styles.sideboxTop}>
              <div className={styles.sideboxIcon}>
                <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" stroke="var(--crimson)" strokeWidth="1.5" opacity=".3"/>
                  <path d="M24 14 v20M14 24 h20" stroke="var(--crimson)" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Not sure where you fall?</h3>
              <p>A urology consultation is the safest way to rule out serious conditions. Many findings that appear alarming are benign — and many conditions that seem minor deserve prompt attention.</p>
            </div>
            <div className={styles.urgencyKey}>
              <span className={styles.sideboxMono}>Urgency guide</span>
              {[
                ['Immediate', '#b3122a', 'Within hours'],
                ['Prompt', '#d4660a', 'Within 1–2 days'],
                ['Routine', '#2a7a3a', 'Within weeks'],
                ['Planned', '#1a6ea6', 'At your convenience'],
              ].map(([label, color, desc]) => (
                <div key={label} className={styles.keyItem}>
                  <span className={styles.keyDot} style={{ background: color }}/>
                  <div>
                    <span className={styles.keyLabel} style={{ color }}>{label}</span>
                    <span className={styles.keyDesc}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <a href="#contact" className={`btn btn-primary ${styles.sideboxBtn}`}>
              Book a consultation <span className="arr">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
