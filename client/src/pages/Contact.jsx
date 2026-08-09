import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import { SITE_URL, DOCTOR } from '../config/seo'
import { getContactInfo, submitAppointment } from '../lib/api'
import styles from './Contact.module.css'

const CONTACT_FALLBACK = {
  email: 'info@drnamanaggarwal.com',
  phone: '+911142888888',
  phoneLabel: 'Manipal Hospital Dwarka',
  responseTime: 'Response within 24 hours',
}

const LOCATIONS_FALLBACK = [
  {
    kind: 'primary',
    name: 'Manipal Hospital, Dwarka',
    addressLine: 'Palam Vihar Colony, Sector 6',
    landmark: 'Near MTNL Office',
    city: 'Dwarka, Delhi',
    schedule: [{ days: 'Tue & Sat', hours: '9:00 AM – 3:00 PM' }, { days: 'Wed – Thu', hours: '11:00 AM – 3:00 PM' }],
    consultationFee: 1500,
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.151058565209!2d77.06684367614186!3d28.595244775685092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b3ae0cf4f6f%3A0xec55552f03c1526d!2sManipal%20Hospital%20Delhi!5e0!3m2!1sen!2sin!4v1782467063048!5m2!1sen!2sin',
    directions: [
      { mode: 'By Metro', detail: 'Dwarka Sector 10 (Blue Line) → 5 min cab' },
      { mode: 'By Road', detail: 'Dwarka Expressway / Palam Road, Sector 6' },
      { mode: 'From Airport', detail: 'IGI Terminal 3 → 15 min via NH-48 / Palam Road' },
    ],
  },
  {
    kind: 'oncall',
    name: 'Maharaja Agarsain Hospital',
    addressLine: 'D Block, Ashok Vihar Phase 1, Delhi',
    schedule: [{ days: 'On-call basis', hours: '' }],
  },
  {
    kind: 'secondary',
    name: 'Veena Nursing Home',
    addressLine: 'Pocket A-1, Sector 8, Near Deepali Chowk, Delhi',
    schedule: [{ days: 'Mon–Sat', hours: '6:30–8:30 AM & 7:00–9:00 PM' }],
    consultationFee: 1000,
  },
]

const CLINIC_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: `${DOCTOR.name} — ${DOCTOR.hospital}`,
  url: `${SITE_URL}/contact`,
  image: DOCTOR.image,
  telephone: DOCTOR.telephone,
  email: DOCTOR.email,
  priceRange: '₹1000–₹1500',
  address: {
    '@type': 'PostalAddress',
    streetAddress: DOCTOR.addressLine,
    addressLocality: DOCTOR.addressLocality,
    addressRegion: DOCTOR.addressRegion,
    postalCode: DOCTOR.postalCode,
    addressCountry: DOCTOR.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: DOCTOR.geo.latitude,
    longitude: DOCTOR.geo.longitude,
  },
  medicalSpecialty: DOCTOR.medicalSpecialty,
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Saturday'], opens: '09:00', closes: '15:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Wednesday', 'Thursday'], opens: '11:00', closes: '15:00' },
  ],
  physician: { '@type': 'Physician', name: DOCTOR.name, jobTitle: DOCTOR.jobTitle },
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', preferredTime: '', website: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [contactData, setContactData] = useState(null)

  useEffect(() => {
    let cancelled = false
    getContactInfo().then(data => { if (!cancelled) setContactData(data) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const contact = contactData?.contact && Object.keys(contactData.contact).length ? contactData.contact : CONTACT_FALLBACK
  const locations = contactData?.locations?.length ? contactData.locations : LOCATIONS_FALLBACK
  const primary = locations.find(l => l.kind === 'primary') || locations[0]
  const others = locations.filter(l => l !== primary)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      await submitAppointment(form)
      setSent(true)
    } catch (err) {
      setError(err.details ? Object.values(err.details)[0] : err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className={styles.page}>
      <Seo
        title="Book a Consultation"
        description="Book a consultation with Dr. Naman Aggarwal, Consultant Urologist at Manipal Hospital, Dwarka, Delhi. In-person and teleconsultation appointments available."
        path="/contact"
        jsonLd={CLINIC_JSON_LD}
      />
      {/* Hero banner */}
      <section className={styles.hero}>
        <div className={styles.heroBg}/>
        <div className="wrap">
          <motion.div className={styles.heroContent} {...fadeUp(0.1)}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Reach Out</span>
            <h1 className={styles.heroH1}>Book a <em>consultation</em></h1>
            <p className={styles.heroSub}>Manipal Hospital, Dwarka, Delhi · Teleconsultation available · Response within 24 hours</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.mainSection}>
        <div className="wrap">
          <div className={styles.grid}>
            {/* Left: contact info */}
            <motion.div className={styles.info} {...fadeUp()}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Primary Hospital</span>
                <h3>{primary.name}</h3>
                <p>{primary.addressLine}{primary.city ? <><br/>{primary.city}</> : null}{primary.landmark ? <><br/>{primary.landmark}</> : null}</p>
              </div>

              {primary.schedule?.length > 0 && (
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>OPD Schedule</span>
                  <p>
                    {primary.schedule.map((s, i) => (
                      <span key={i}><b>{s.days}:</b> {s.hours}{s.note ? ` (${s.note})` : ''}<br/></span>
                    ))}
                    {primary.consultationFee ? `Consultation fee: ₹${primary.consultationFee}` : null}
                  </p>
                </div>
              )}

              {others.length > 0 && (
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>Also available at</span>
                  {others.map((loc, i) => (
                    <p key={loc.name} style={i > 0 ? { marginTop: 10 } : undefined}>
                      <b>{loc.name}</b><br/>{loc.addressLine}
                      <br/>{loc.schedule?.map(s => `${s.days}${s.hours ? ': ' + s.hours : ''}`).join(' · ')}
                      {loc.consultationFee ? ` · ₹${loc.consultationFee}` : ''}
                    </p>
                  ))}
                </div>
              )}

              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Contact</span>
                <div className={styles.contactLinks}>
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className={styles.contactLink}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 2h3l1 3-1.5 1.5C6.5 9 7 9.5 9.5 11.5L11 10l3 1v3c0 1-4 3-9-2S1 4 2 3l1-1z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                      </svg>
                      {contact.phoneLabel || contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className={styles.contactLink}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M1.5 5.5l6.5 4.5 6.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      {contact.email}
                    </a>
                  )}
                </div>
              </div>

              {primary.directions?.length > 0 && (
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>How to reach {primary.name}</span>
                  <ul className={styles.directionsList}>
                    {primary.directions.map(d => <li key={d.mode}><b>{d.mode}:</b> {d.detail}</li>)}
                  </ul>
                </div>
              )}

              {/* Google Maps */}
              <motion.div className={styles.mapWrap} {...fadeUp(0.15)}>
                <iframe
                  src={primary.mapEmbedUrl || LOCATIONS_FALLBACK[0].mapEmbedUrl}
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={primary.name}
                  className={styles.mapFrame}
                />
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
                    <label htmlFor="preferredTime">Preferred appointment time</label>
                    <select id="preferredTime" name="preferredTime" value={form.preferredTime} onChange={handleChange}>
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
                  <input
                    type="text" name="website" tabIndex={-1} autoComplete="off"
                    value={form.website} onChange={handleChange}
                    style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true"
                  />
                  {error && <p className={styles.req} role="alert">{error}</p>}
                  <div className={styles.formFooter}>
                    <p className={styles.guarantee}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="7" r="6" stroke="var(--crimson)" strokeWidth="1.2"/>
                        <path d="M7 5v3M7 9.5v.5" stroke="var(--crimson)" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Response within 24 hours. Your information is kept strictly confidential.
                    </p>
                    <button type="submit" className="btn btn-primary" disabled={sending}>
                      {sending ? 'Sending…' : 'Send message'} {!sending && <span className="arr">→</span>}
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
