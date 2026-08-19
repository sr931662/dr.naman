import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContent } from '../lib/ContentProvider'
import styles from './PhotoGallery.module.css'
import drNaman from '../assets/Dr__Naman.jpg'

/**
 * Falls back gracefully if a CMS-stored image URL 404s — e.g. a seed record
 * pointing at a file that was never actually uploaded, or an upload lost to
 * Cloud Run's ephemeral filesystem (see DEPLOY.md's known limitation). Without
 * this a broken URL just renders a blank broken-image icon forever.
 */
function GalleryImage({ src, alt, fallbackSrc, className }) {
  const [failed, setFailed] = useState(false)
  if (failed && !fallbackSrc) return null
  return <img src={failed ? fallbackSrc : src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)}/>
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
})

const PHOTOS_FALLBACK = [
  {
    featured: true,
    label: 'Dr. Naman Aggarwal',
    sub: 'MCh Urology · ASRM · Consultant Urologist, Delhi',
    image: { url: drNaman, alt: 'Dr. Naman Aggarwal — Consultant Urologist, Delhi' },
  },
  {
    label: 'OPD Consultation',
    sub: 'Consultation room · Delhi',
    image: { url: 'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=800&q=80', alt: "Dr. Naman Aggarwal's OPD consultation room in Delhi" },
  },
  {
    label: 'Surgical Suite',
    sub: 'Minimally invasive · Laparoscopic',
    image: { url: 'https://images.unsplash.com/photo-1758206523711-f20bb01033a5?auto=format&fit=crop&w=800&q=80', alt: 'Minimally invasive laparoscopic surgical suite used by Dr. Naman Aggarwal, urologist in Delhi' },
  },
  {
    label: 'Endoscopy Unit',
    sub: 'RIRS · Ureteroscopy · PCNL',
    image: { url: 'https://plus.unsplash.com/premium_photo-1661627109539-69d7096ea354?auto=format&fit=crop&w=800&q=80', alt: 'Endoscopy unit for RIRS, ureteroscopy and PCNL kidney stone procedures in Delhi' },
  },
  {
    label: 'Patient Care',
    sub: 'Post-operative follow-up',
    image: { url: 'https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?auto=format&fit=crop&w=800&q=80', alt: 'Post-operative patient follow-up care with Dr. Naman Aggarwal, urologist and andrologist in Delhi' },
  },
]

export default function PhotoGallery() {
  const { home } = useContent()
  const PHOTOS = home?.photos?.length ? home.photos : PHOTOS_FALLBACK
  const featuredIndex = Math.max(0, PHOTOS.findIndex(p => p.featured))

  const [active, setActive] = useState(featuredIndex)
  const thumbRefs = useRef([])
  const current = PHOTOS[active] || PHOTOS[0]

  const prev = () => setActive(a => (a - 1 + PHOTOS.length) % PHOTOS.length)
  const next = () => setActive(a => (a + 1) % PHOTOS.length)

  // Keeps the active thumbnail in view when it's changed via the arrows rather
  // than a direct click on a (possibly off-screen) thumbnail.
  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [active])

  return (
    <section className={styles.section} id="gallery">
      <div className="wrap">
        <motion.div className={styles.head} {...fadeUp()}>
          <span className="eyebrow">In Practice</span>
          <h2>The doctor &amp; <em>the clinic</em></h2>
          <p className="lead">Eleven years of focused urological practice across Delhi — where precision meets patient-first care.</p>
        </motion.div>

        <motion.div className={styles.stage} {...fadeUp(0.1)}>
          <div className={styles.preview}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className={styles.previewFrame}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <GalleryImage
                  src={current.image.url}
                  alt={current.image.alt || current.label}
                  fallbackSrc={active === featuredIndex ? drNaman : undefined}
                  className={styles.previewImg}
                />
                <div className={styles.previewCaption}>
                  <span className={styles.captionName}>{current.label}</span>
                  <span className={styles.captionSub}>{current.sub}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {PHOTOS.length > 1 && (
              <>
                <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous photo">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next photo">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {PHOTOS.length > 1 && (
            <div className={styles.scrollWrap}>
              <div className={styles.track}>
                {PHOTOS.map((p, i) => (
                  <button
                    key={`${p.label}-${i}`}
                    ref={node => { thumbRefs.current[i] = node }}
                    className={`${styles.thumb}${i === active ? ' ' + styles.thumbActive : ''}`}
                    onClick={() => setActive(i)}
                    aria-label={`Show ${p.label}`}
                    aria-current={i === active}
                  >
                    <span className={styles.thumbVisual}>
                      <GalleryImage
                        src={p.image.url}
                        alt=""
                        fallbackSrc={i === featuredIndex ? drNaman : undefined}
                        className={styles.thumbImg}
                      />
                    </span>
                    <span className={styles.thumbLabel}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
