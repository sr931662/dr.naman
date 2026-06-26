import { motion } from 'framer-motion'
import styles from './Reels.module.css'

const REELS = [
  { title: 'What is RIRS?', platform: 'youtube', duration: '2:14', views: '12K', desc: 'Flexible ureteroscopy explained simply', gradient: 'linear-gradient(160deg,#1a0a0e,#3d1020,#6b1f36)' },
  { title: 'HoLEP vs TURP', platform: 'youtube', duration: '3:40', views: '8.2K', desc: 'Why HoLEP is now preferred for BPH', gradient: 'linear-gradient(160deg,#0d0d14,#1a1a2e,#2a2850)' },
  { title: 'Varicocele & Male Fertility', platform: 'instagram', duration: '0:58', views: '21K', desc: 'The link between varicocele and infertility', gradient: 'linear-gradient(160deg,#0f1a12,#1a3020,#2a4a2e)' },
  { title: 'Living Donor Transplant', platform: 'youtube', duration: '4:10', views: '6.7K', desc: 'What to expect as a living kidney donor', gradient: 'linear-gradient(160deg,#1a1410,#2e2218,#4a3828)' },
  { title: 'Blood in Urine — When to Worry', platform: 'instagram', duration: '1:05', views: '34K', desc: 'Haematuria: causes and when to act', gradient: 'linear-gradient(160deg,#1a0a0e,#2e0f1c,#501428)' },
  { title: 'Robotic Surgery in Urology', platform: 'youtube', duration: '5:22', views: '9.8K', desc: 'The Da Vinci robot in urological practice', gradient: 'linear-gradient(160deg,#0e1218,#192030,#243040)' },
]

function YouTubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M10 9.5l5 2.5-5 2.5V9.5z" fill="currentColor"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

export default function Reels() {
  return (
    <section className={styles.section} id="reels">
      <div className="wrap">
        <motion.div
          className={styles.head}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">Watch &amp; Learn</span>
          <h2>Explained in <em>minutes</em></h2>
          <p className="lead">Short, clear videos on urological conditions — from Dr. Aggarwal&#39;s clinical perspective.</p>
        </motion.div>
      </div>

      <div className={styles.scrollWrap}>
        <div className={styles.track}>
          {REELS.map((r, i) => (
            <motion.div
              key={i}
              className={styles.reel}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <div className={styles.visual} style={{ background: r.gradient }}>
                <svg className={styles.pattern} viewBox="0 0 160 280" aria-hidden="true">
                  <defs>
                    <pattern id={`rp${i}`} x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                      <circle cx="16" cy="16" r="0.8" fill="rgba(255,255,255,.08)"/>
                      <line x1="16" y1="6" x2="16" y2="26" stroke="rgba(255,255,255,.04)" strokeWidth="0.4"/>
                      <line x1="6" y1="16" x2="26" y2="16" stroke="rgba(255,255,255,.04)" strokeWidth="0.4"/>
                    </pattern>
                  </defs>
                  <rect width="160" height="280" fill={`url(#rp${i})`}/>
                  <circle cx="80" cy="140" r="50" stroke="rgba(255,255,255,.05)" strokeWidth="0.5" fill="none"/>
                </svg>

                <div className={styles.playBtn}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M8 6l10 5-10 5V6z" fill="#fff"/>
                  </svg>
                </div>

                <div className={styles.topMeta}>
                  <span className={`${styles.platform} ${r.platform === 'youtube' ? styles.yt : styles.ig}`}>
                    {r.platform === 'youtube' ? <YouTubeIcon/> : <InstagramIcon/>}
                    {r.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                  </span>
                </div>
              </div>

              <div className={styles.info}>
                <span className={styles.reelTitle}>{r.title}</span>
                <span className={styles.reelDesc}>{r.desc}</span>
                <div className={styles.reelMeta}>
                  <span>{r.views} views</span>
                  <span className={styles.dot2}>·</span>
                  <span>{r.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="wrap">
        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <a href="https://instagram.com/drnaman.uro" target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${styles.ctaBtn}`}>
            <InstagramIcon/> Follow on Instagram
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${styles.ctaBtn}`}>
            <YouTubeIcon/> Subscribe on YouTube
          </a>
        </motion.div>
      </div>
    </section>
  )
}
