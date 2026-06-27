import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Philosophy.module.css'

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.15 } } }

const CARDS = [
  { n: '01', title: 'Listen deeply', body: 'A compassionate listener who takes the time to understand every concern — simplifying complex medicine until patients and families feel genuinely informed and assured.' },
  { n: '02', title: 'Operate precisely', body: 'At the forefront of robotic and minimally-invasive technique, always seeking the latest evidence-based advances to sharpen outcomes and shorten recovery.' },
  { n: '03', title: 'Care completely', body: 'A multidisciplinary approach for complex cases and comorbidities, with an unwavering commitment to confidentiality and the highest standards of ethical practice.' },
]

export default function Philosophy() {
  const [open, setOpen] = useState(0)

  return (
    <section className={styles.section} id="philosophy">
      <svg className={styles.glyph} viewBox="0 0 100 130"><use href="#kidney" width="100" height="130"/></svg>
      <div className={`wrap ${styles.inner}`}>
        <motion.div
          className={styles.quote}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.span className="eyebrow" style={{ justifyContent: 'center' }} variants={fadeUp}>The Philosophy</motion.span>
          <motion.blockquote variants={fadeUp}>
            "A scan shows me the disease. A conversation shows me the <em>person</em>. I refuse to treat one without the other."
          </motion.blockquote>
          <motion.cite variants={fadeUp}>— Dr. Naman Aggarwal</motion.cite>
        </motion.div>

        <motion.div
          className={styles.accordion}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {CARDS.map((card, i) => (
            <motion.div key={card.n} className={`${styles.item}${open === i ? ' ' + styles.itemOpen : ''}`} variants={fadeUp}>
              <button
                className={styles.trigger}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span className={styles.cardNum}>{card.n}</span>
                <h3 className={styles.triggerTitle}>{card.title}</h3>
                <span className={`${styles.chevron}${open === i ? ' ' + styles.chevronOpen : ''}`} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    className={styles.body}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className={styles.bodyText}>{card.body}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
