import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FAQS } from '../data/faqs'
import styles from './FAQ.module.css'

export default function FAQ() {
  const [open, setOpen] = useState(null)
  const toggle = i => setOpen(open === i ? null : i)

  return (
    <section className={styles.section} id="faq">
      <div className="wrap">
        <div className={styles.layout}>
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow">Common Questions</span>
            <h2>Frequently <em>asked</em></h2>
            <p className="lead">Answers to the questions patients most often bring to their first consultation.</p>
            <Link to="/contact" className={`btn btn-primary ${styles.askBtn}`}>
              Ask Dr. Aggarwal <span className="arr">→</span>
            </Link>
          </motion.div>

          <div className={styles.items}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              >
                <button
                  className={styles.question}
                  onClick={() => toggle(i)}
                  aria-expanded={open === i}
                >
                  <span className={`${styles.num} ${open === i ? styles.numOpen : ''}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.qText}>{faq.q}</span>
                  <span className={`${styles.chevron} ${open === i ? styles.chevronOpen : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      className={styles.answer}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            <motion.div
              className={styles.footer}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Have a different question?{' '}
              <Link to="/contact" className={styles.writeLink}>Write to us →</Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
