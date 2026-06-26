import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Testimonials.module.css'

const TESTIMONIALS = [
  {
    quote: "I was terrified of surgery. Dr. Aggarwal explained every step with a calm clarity I had never experienced with a doctor before. The RIRS procedure was over in an hour, and I was home the same evening.",
    name: "Rajesh Kumar", location: "Delhi NCR", condition: "Kidney Stone — RIRS",
    initials: "RK", stars: 5
  },
  {
    quote: "After two years of failed fertility treatments, a friend referred me to Dr. Aggarwal for a varicocele assessment. Within eight months of microsurgery, we had our first child. I cannot put that into words.",
    name: "Arjun Mehta", location: "Gurgaon", condition: "Varicocele Microsurgery",
    initials: "AM", stars: 5
  },
  {
    quote: "My father had an enlarged prostate that was affecting his sleep and quality of life for years. Dr. Aggarwal performed HoLEP and the transformation was remarkable. He is a different person now.",
    name: "Priya Sharma", location: "Noida", condition: "HoLEP — Enlarged Prostate",
    initials: "PS", stars: 5
  },
  {
    quote: "Dr. Aggarwal coordinated my husband's living-donor kidney transplant with exceptional professionalism. The team, the surgery, the aftercare — every detail was handled with precision and warmth.",
    name: "Sunita Verma", location: "Faridabad", condition: "Renal Transplantation",
    initials: "SV", stars: 5
  },
  {
    quote: "I came in for a kidney tumour that three other doctors called inoperable. Dr. Aggarwal performed a partial nephrectomy laparoscopically. I kept my kidney. That is everything.",
    name: "Vikram Singh", location: "Chandigarh", condition: "Partial Nephrectomy",
    initials: "VS", stars: 5
  },
]

function Stars({ count }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 3.9L8 10.5l-3.6 1.9.7-3.9L2.2 5.7l4-.6z" fill="var(--crimson)"/>
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setActive(a => (a + 1) % TESTIMONIALS.length)
  const t = TESTIMONIALS[active]

  return (
    <section className={styles.section} id="voices">
      <div className={styles.bg}/>
      <div className={styles.quoteDecor}>&ldquo;</div>
      <div className="wrap">
        <motion.div
          className={styles.head}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow" style={{ justifyContent: 'center', color: 'rgba(255,255,255,.7)' }}>In Their Words</span>
          <h2 className={styles.heading}>Voices of <em>patients</em></h2>
        </motion.div>

        <div className={styles.stage}>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous testimonial">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={styles.content}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className={styles.item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Stars count={t.stars}/>
                <blockquote className={styles.quote}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className={styles.patient}>
                  <div className={styles.avatar}>{t.initials}</div>
                  <div className={styles.patientInfo}>
                    <span className={styles.patientName}>{t.name}</span>
                    <span className={styles.patientMeta}>{t.location}</span>
                  </div>
                  <span className={styles.conditionTag}>{t.condition}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next testimonial">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.dots}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
