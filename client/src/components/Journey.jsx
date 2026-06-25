import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import styles from './Journey.module.css'

const ITEMS = [
  { side: 'left', year: 'Certification · ASRM', title: 'Andrology Certification', desc: 'Awarded by the American Society for Reproductive Medicine — formal credentialing in male fertility and reproductive surgery.' },
  { side: 'right', year: 'Observership · Dubai', title: 'First IVF, Dubai (UAE)', desc: 'International observership in advanced reproductive medicine, deepening expertise in andrology and assisted fertility.' },
  { side: 'left', year: '2022 · Fellowship', title: 'Devon Traveling Fellowship', desc: 'A competitive traveling fellowship recognising surgical promise and a commitment to evolving urological practice.' },
  { side: 'right', year: '2022 · Symposium', title: 'KUACON · Davangere PG Symposium', desc: 'Active contribution to the postgraduate urological community through regional academic symposia.' },
  { side: 'left', year: 'Present · Medanta', title: 'Consultant — Medanta, Gurugram', desc: "Practising across urology, andrology, uro-oncology and renal transplantation at one of India's most respected institutions." },
]

function TimelineRow({ item }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const card = (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, x: item.side === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className={styles.year}>{item.year}</div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </motion.div>
  )
  return (
    <div ref={ref} className={styles.row}>
      <div className={`${styles.node}${inView ? ' ' + styles.nodeActive : ''}`}/>
      {item.side === 'left' ? <>{card}<div className={styles.spacer}/></> : <><div className={styles.spacer}/>{card}</>}
    </div>
  )
}

export default function Journey() {
  const tlRef = useRef(null)
  const [spineH, setSpineH] = useState(0)

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    const onScroll = () => {
      const rect = tl.getBoundingClientRect()
      const visible = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height))
      setSpineH(visible * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className={styles.section} id="journey">
      <motion.div
        className={`wrap ${styles.head}`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="eyebrow">The Making of a Surgeon</span>
        <h2>Training that crosses<br/>borders &amp; disciplines.</h2>
      </motion.div>
      <div className="wrap">
        <div className={styles.timeline} ref={tlRef}>
          <div className={styles.spine} style={{ height: `${spineH}%` }}/>
          {ITEMS.map((item, i) => <TimelineRow key={i} item={item}/>)}
        </div>
      </div>
    </section>
  )
}
