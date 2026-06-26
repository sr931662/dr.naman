import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Contact.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', time: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <main className={styles.page}>
      {/* Hero banner */}
      <section className={styles.hero}>
        <div className={styles.heroBg}/>
        <div className="wrap">
          <motion.div className={styles.heroContent} {...fadeUp(0.1)}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Reach Out</span>
            <h1 className={styles.heroH1}>Book a <em>consultation</em></h1>
            <p className={styles.heroSub}>Medanta Gurugram · Teleconsultation available · Response within 24 hours</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.mainSection}>
        <div className="wrap">
          <div className={styles.grid}>
            {/* Left: contact info */}
            <motion.div className={styles.info} {...fadeUp()}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Hospital</span>
                <h3>Medanta — The Medicity</h3>
                <p>CH Baktawar Singh Road<br/>Sector 38, Gurugram<br/>Haryana 122001, India</p>
              </div>

              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>OPD Schedule</span>
                <p>Monday – Saturday<br/>Urology &amp; Transplant OPD<br/>By prior appointment only</p>
              </div>

              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Contact</span>
                <div className={styles.contactLinks}>
                  <a href="tel:+911244141414" className={styles.contactLink}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 2h3l1 3-1.5 1.5C6.5 9 7 9.5 9.5 11.5L11 10l3 1v3c0 1-4 3-9-2S1 4 2 3l1-1z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                    </svg>
                    +91-124-414-1414 (Medanta)
                  </a>
                  <a href="mailto:info@drnamanaggarwal.com" className={styles.contactLink}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1.5 5.5l6.5 4.5 6.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    info@drnamanaggarwal.com
                  </a>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>How to reach Medanta</span>
                <ul className={styles.directionsList}>
                  <li><b>By Metro:</b> HUDA City Centre (Yellow Line) → 10 min cab</li>
                  <li><b>By Road:</b> NH-48 Delhi–Jaipur Highway, Sector 38 exit</li>
                  <li><b>From Airport:</b> IGI Terminal 3 → 25 min via NH-48</li>
                </ul>
              </div>

              {/* Map Placeholder */}
              <motion.div className={styles.map} {...fadeUp(0.15)}>
                <svg viewBox="0 0 100 80" fill="none" className={styles.mapPin} aria-hidden="true">
                  <circle cx="50" cy="50" r="34" stroke="var(--crimson)" strokeWidth="1.2" opacity=".25"/>
                  <path d="M50 22 C43 22 38 27 38 34 C38 43 50 58 50 58 C50 58 62 43 62 34 C62 27 57 22 50 22z" fill="var(--crimson)" opacity=".85"/>
                  <circle cx="50" cy="34" r="5" fill="#fff"/>
                </svg>
                <div className={styles.mapInfo}>
                  <span className={styles.mapTitle}>Medanta Hospital</span>
                  <span className={styles.mapAddr}>Sector 38, Gurugram</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: form */}
            <motion.div className={styles.formWrap} {...fadeUp(0.15)}>
              <div className={styles.formHead}>
                <h2>Send a message</h2>
                <p>Fill in your details and we&#39;ll get back to you within 24 hours to confirm your appointment.</p>
              </div>

              {sent ? (
                <motion.div
                  className={styles.successMsg}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.successIcon}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <circle cx="16" cy="16" r="14" stroke="var(--crimson)" strokeWidth="1.5"/>
                      <path d="M10 16l5 5 7-9" stroke="var(--crimson)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Thank you, {form.name || 'there'}.</h3>
                  <p>Your message has been received. Dr. Aggarwal&#39;s team will contact you within 24 hours to confirm your appointment.</p>
                </motion.div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="name">Full name <span className={styles.req}>*</span></label>
                      <input id="name" name="name" type="text" required placeholder="Your full name" value={form.name} onChange={handleChange}/>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="phone">Phone number <span className={styles.req}>*</span></label>
                      <input id="phone" name="phone" type="tel" required placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange}/>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange}/>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="time">Preferred appointment time</label>
                    <select id="time" name="time" value={form.time} onChange={handleChange}>
                      <option value="">Select a preference</option>
                      <option>Morning (9am – 12pm)</option>
                      <option>Afternoon (12pm – 4pm)</option>
                      <option>Evening (4pm – 7pm)</option>
                      <option>Teleconsultation (any time)</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="message">Message / Symptoms <span className={styles.req}>*</span></label>
                    <textarea id="message" name="message" required rows={5} placeholder="Briefly describe your symptoms or reason for consultation..." value={form.message} onChange={handleChange}/>
                  </div>
                  <div className={styles.formFooter}>
                    <p className={styles.guarantee}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="7" r="6" stroke="var(--crimson)" strokeWidth="1.2"/>
                        <path d="M7 5v3M7 9.5v.5" stroke="var(--crimson)" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Response within 24 hours. Your information is kept strictly confidential.
                    </p>
                    <button type="submit" className="btn btn-primary">
                      Send message <span className="arr">→</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
