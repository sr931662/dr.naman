import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Testimonials.module.css'

const ITEMS = [
  { quote: 'He explained my kidney transplant so calmly that my fear simply dissolved. Months on, I wake up grateful every single morning.', who: 'Transplant recipient', meta: 'Patient testimonial · placeholder' },
  { quote: 'I had seen three specialists before Dr. Aggarwal. He was the first who actually listened — and the first whose treatment worked.', who: 'Urology patient', meta: 'Patient testimonial · placeholder' },
  { quote: 'After years of trying, we became parents. He treated our fertility journey with science, patience and remarkable kindness.', who: 'Andrology patient', meta: 'Patient testimonial · placeholder' },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  return (
    <section className={styles.section} id="voices">
      <div className="wrap">
        <motion.div
          className={styles.head}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow" style={{ justifyContent: 'center' }}>In Their Words</span>
          <h2>Voices of patients</h2>
        </motion.div>
        <div className={styles.stage}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className={styles.item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.quoteMark}>"</div>
              <blockquote>{ITEMS[active].quote}</blockquote>
              <div className={styles.who}>
                <b>{ITEMS[active].who}</b>
                <span>{ITEMS[active].meta}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.dots}>
          {ITEMS.map((_, i) => (
            <button
              key={i}
              className={active === i ? styles.dotActive : ''}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
