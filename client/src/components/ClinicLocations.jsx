import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getContactInfo } from '../lib/api'
import { LOCATIONS_FALLBACK, DEFAULT_BADGE } from '../data/locations'
import styles from './ClinicLocations.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

/**
 * Self-contained clinic-cards section, shared by the Home and Contact pages.
 * Pass `locations` when the parent has already fetched them (Contact page)
 * to avoid a second request; otherwise it fetches its own.
 */
export default function ClinicLocations({ locations: locationsProp, id }) {
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    if (locationsProp) return
    let cancelled = false
    getContactInfo().then(data => { if (!cancelled) setFetched(data?.locations) }).catch(() => {})
    return () => { cancelled = true }
  }, [locationsProp])

  const locations = locationsProp?.length ? locationsProp : (fetched?.length ? fetched : LOCATIONS_FALLBACK)
  const clinicCards = locations.filter(l => l.kind === 'primary' || l.kind === 'secondary')

  if (!clinicCards.length) return null

  return (
    <section className={styles.locSection} id={id}>
      <div className="wrap">
        <motion.div className={styles.sHead} {...fadeUp()}>
          <span className="eyebrow">Clinic Locations</span>
          <h2>Where to <em>find him</em></h2>
        </motion.div>
        <div className={styles.locGrid}>
          {clinicCards.map((loc, i) => (
            <motion.div key={loc.name} className={styles.locCard} {...fadeUp(0.08 + i * 0.08)}>
              {loc.image?.url && (
                <div className={styles.locImage}>
                  <img src={loc.image.url} alt={loc.image.alt || loc.name} loading="lazy"/>
                </div>
              )}
              <div className={styles.locBody}>
                <span className={styles.locBadge}>{loc.badgeLabel || DEFAULT_BADGE[loc.kind] || 'Consulting At'}</span>
                <h3>{loc.name}</h3>
                <p className={styles.locAddress}>
                  {loc.addressLine}{loc.landmark ? `, ${loc.landmark}` : ''}{loc.city ? `, ${loc.city}` : ''}{loc.pincode ? ` – ${loc.pincode}` : ''}
                </p>
                {loc.schedule?.length > 0 && (
                  <ul className={styles.locSchedule}>
                    {loc.schedule.map((s, si) => (
                      <li key={si}><b>{s.days}</b><span>{s.hours}{s.note ? ` (${s.note})` : ''}</span></li>
                    ))}
                  </ul>
                )}
                {loc.consultationFee ? <p className={styles.locFee}>Consultation fee: ₹{loc.consultationFee}</p> : null}
                <div className={styles.locActions}>
                  {loc.phone && <a href={`tel:${loc.phone}`} className="btn btn-ghost">Call</a>}
                  {loc.mapLink && <a href={loc.mapLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Get directions <span className="arr">→</span></a>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
