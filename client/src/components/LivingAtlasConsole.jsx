import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './LivingAtlasConsole.module.css'

const SPECS = ['urology', 'andrology', 'onco', 'transplant']
const AUTO_DELAY = 5000

const readouts = {
  urology: {
    tag: '01 / Field', title: 'Urology',
    focus: 'Kidney · Ureter\nBladder · Prostate',
    desc: 'Comprehensive care for the urinary tract, with a minimally-invasive bias wherever it serves the patient — from stone disease to obstruction.',
    procs: ['Kidney stones — PCNL & RIRS','Enlarged prostate — HoLEP','Urinary obstruction','Recurrent UTIs','Haematuria']
  },
  andrology: {
    tag: '02 / Field', title: 'Andrology',
    focus: 'Testis · Spermatic cord\nHormonal axis',
    desc: 'Certified in Andrology by the ASRM, with an observership at First IVF, Dubai — restoring fertility, hormonal balance and confidence through microsurgery.',
    procs: ['Male infertility','Varicocele microsurgery','Erectile dysfunction','Low testosterone','Vasectomy & reversal']
  },
  onco: {
    tag: '03 / Field', title: 'Uro-oncology',
    focus: 'Tumour staging\nMargin control',
    desc: 'Organ-preserving, oncologically-sound surgery for tumours of the kidney, prostate, bladder and testis — staged precisely, resected with the narrowest safe margin.',
    procs: ['Kidney — partial nephrectomy','Prostate — robotic','Bladder — TURBT','Testicular tumours']
  },
  transplant: {
    tag: '04 / Field', title: 'Renal Transplant',
    focus: 'Graft · Anastomosis\nIliac fossa',
    desc: 'End-to-end transplant care — from donor work-up and laparoscopic retrieval to the anastomosis and lifelong graft surveillance — giving patients their mornings back.',
    procs: ['Living-donor transplant','Deceased-donor transplant','Laparoscopic donor nephrectomy','Post-transplant care']
  }
}

function UrologyDiagram() {
  return (
    <svg className="dgm" viewBox="0 0 440 380">
      <defs><radialGradient id="bl1" cx="50%" cy="42%" r="55%"><stop offset="0" stopColor="rgba(179,18,42,.10)"/><stop offset="1" stopColor="rgba(179,18,42,0)"/></radialGradient></defs>
      <ellipse cx="220" cy="160" rx="180" ry="150" fill="url(#bl1)"/>
      <g className="breathe">
        <use href="#kidney" x="296" y="44" width="80" height="104"/>
        <use href="#kidney" x="64" y="44" width="80" height="104" transform="translate(208,0) scale(-1,1)"/>
      </g>
      <path className="anat" d="M306 150 C292 196 270 232 240 268"/>
      <path className="anat" d="M134 150 C148 196 170 232 200 268"/>
      <path className="flow" d="M306 150 C292 196 270 232 240 268"/>
      <path className="flow" d="M134 150 C148 196 170 232 200 268"/>
      <path className="anat" d="M220 258 C260 258 286 282 286 312 C286 344 258 360 220 360 C182 360 154 344 154 312 C154 282 180 258 220 258 Z"/>
      <path className="anat" d="M214 360 L214 378 M226 360 L226 378"/>
      <line className="lead" x1="352" y1="78" x2="402" y2="62"/><circle className="dot" cx="352" cy="78" r="2.6"/><text className="lbl" x="406" y="65">Kidney</text>
      <line className="lead" x1="262" y1="232" x2="306" y2="232"/><circle className="dot" cx="262" cy="232" r="2.6"/><text className="lbl" x="310" y="235">Ureter</text>
      <circle className="dot" cx="220" cy="312" r="2.6"/><text className="lbl" x="220" y="338" textAnchor="middle">Bladder</text>
    </svg>
  )
}

function AndrologyDiagram() {
  return (
    <svg className="dgm" viewBox="0 0 440 380">
      <defs><radialGradient id="bl3" cx="38%" cy="58%" r="54%"><stop offset="0" stopColor="rgba(179,18,42,.10)"/><stop offset="1" stopColor="rgba(179,18,42,0)"/></radialGradient></defs>
      <ellipse cx="180" cy="232" rx="168" ry="138" fill="url(#bl3)"/>
      <path className="anat" d="M150 44 C150 92 154 122 168 152"/>
      <path className="anat thin" d="M166 44 C166 92 170 122 184 154"/>
      <path className="anat thin" d="M134 48 C134 94 138 124 154 156"/>
      <path className="flow" d="M150 44 C150 92 154 122 168 152"/>
      <ellipse className="anat" cx="168" cy="214" rx="64" ry="78"/>
      <path className="anat" d="M222 172 C242 188 244 222 228 254 C220 270 208 278 204 272"/>
      <path className="anat thin" d="M168 214 C148 204 148 228 168 228 C192 228 194 196 168 194 C136 192 136 244 176 246"/>
      <g className="breathe">
        <circle cx="322" cy="146" r="15" fill="rgba(179,18,42,.08)" stroke="#b3122a" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
        <path className="focal" d="M336 152 C358 164 352 192 374 202 C356 196 362 222 382 228"/>
      </g>
      <line className="lead" x1="150" y1="84" x2="98" y2="70"/><circle className="dot" cx="150" cy="84" r="2.6"/><text className="lbl" x="94" y="66" textAnchor="end">Spermatic cord</text>
      <line className="lead" x1="118" y1="244" x2="66" y2="266"/><circle className="dot" cx="118" cy="244" r="2.6"/><text className="lbl" x="62" y="270" textAnchor="end">Testis</text>
      <circle className="dot" cx="322" cy="146" r="2.6"/><text className="lbl" x="322" y="226" textAnchor="middle">Spermatozoon</text>
    </svg>
  )
}

function OncoDiagram() {
  return (
    <svg className="dgm" viewBox="0 0 440 380">
      <defs><radialGradient id="bl4" cx="46%" cy="48%" r="52%"><stop offset="0" stopColor="rgba(179,18,42,.12)"/><stop offset="1" stopColor="rgba(179,18,42,0)"/></radialGradient></defs>
      <ellipse cx="210" cy="190" rx="180" ry="150" fill="url(#bl4)"/>
      <use href="#kidney" x="92" y="84" width="150" height="195"/>
      <g className="breathe">
        <circle cx="208" cy="182" r="22" fill="rgba(179,18,42,.10)" stroke="#b3122a" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
        <circle cx="208" cy="182" r="9" fill="rgba(179,18,42,.34)"/>
      </g>
      <g className="spin"><circle cx="208" cy="182" r="42" fill="none" stroke="#b3122a" strokeWidth="1.1" strokeDasharray="6 11" opacity=".75" vectorEffect="non-scaling-stroke"/></g>
      <path className="lead" d="M208 124 L208 140 M208 224 L208 240 M150 182 L166 182 M250 182 L266 182"/>
      <circle className="anat thin" cx="306" cy="256" r="14"/><circle className="anat thin" cx="334" cy="238" r="9"/><circle className="anat thin" cx="324" cy="276" r="7"/>
      <line className="lead" x1="234" y1="164" x2="288" y2="126"/><circle className="dot" cx="234" cy="164" r="2.6"/><text className="lbl" x="292" y="122">Targeted lesion</text>
      <line className="lead" x1="306" y1="256" x2="306" y2="306"/><circle className="dot" cx="306" cy="256" r="2.6"/><text className="lbl" x="306" y="320" textAnchor="middle">Cellular margins</text>
    </svg>
  )
}

function TransplantDiagram() {
  return (
    <svg className="dgm" viewBox="0 0 440 380">
      <defs><radialGradient id="bl2" cx="40%" cy="44%" r="58%"><stop offset="0" stopColor="rgba(179,18,42,.10)"/><stop offset="1" stopColor="rgba(179,18,42,0)"/></radialGradient></defs>
      <ellipse cx="190" cy="180" rx="180" ry="150" fill="url(#bl2)"/>
      <path className="anat" d="M348 36 C360 110 360 248 342 352"/>
      <path className="anat thin" d="M368 40 C380 112 380 248 362 354"/>
      <g className="breathe"><use href="#kidney" x="78" y="98" width="120" height="156" transform="translate(276,0) scale(-1,1)"/></g>
      <path className="anat" d="M196 176 C248 168 298 174 340 196"/>
      <path className="flow" d="M196 176 C248 168 298 174 340 196"/>
      <circle className="ring" cx="340" cy="196" r="5"/>
      <path className="anat" d="M200 200 C250 202 300 212 338 232"/>
      <circle className="ring" cx="338" cy="232" r="4.5"/>
      <path className="anat" d="M166 250 C172 292 192 318 210 336"/>
      <path className="anat" d="M210 328 C232 328 248 342 248 358 C248 372 232 378 210 378"/>
      <line className="lead" x1="120" y1="120" x2="68" y2="98"/><circle className="dot" cx="120" cy="120" r="2.6"/><text className="lbl" x="64" y="94" textAnchor="end">Donor kidney</text>
      <line className="lead" x1="306" y1="186" x2="306" y2="150"/><circle className="dot" cx="306" cy="186" r="2.6"/><text className="lbl" x="306" y="144" textAnchor="middle">Anastomosis</text>
      <line className="lead" x1="226" y1="352" x2="276" y2="358"/><circle className="dot" cx="226" cy="352" r="2.6"/><text className="lbl" x="280" y="361">Ureter → bladder</text>
    </svg>
  )
}

const diagrams = { urology: UrologyDiagram, andrology: AndrologyDiagram, onco: OncoDiagram, transplant: TransplantDiagram }

export default function LivingAtlasConsole() {
  const [active, setActive] = useState('urology')
  const timerRef = useRef(null)

  const pick = (spec) => {
    setActive(spec)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(cur => SPECS[(SPECS.indexOf(cur) + 1) % SPECS.length])
    }, AUTO_DELAY)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(cur => SPECS[(SPECS.indexOf(cur) + 1) % SPECS.length])
    }, AUTO_DELAY)
    return () => clearInterval(timerRef.current)
  }, [])

  const ro = readouts[active]

  return (
    <section className={styles.section} id="expertise">
      <motion.div
        className={`wrap ${styles.head}`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="eyebrow">The Living Atlas</span>
        <h2>Four disciplines,<br/>read like an instrument.</h2>
        <p className="lead">Most surgeons hand you a list. Explore Dr. Aggarwal's practice the way he sees it — a live anatomical console. Select a discipline, or let it play, and watch the system come alive.</p>
      </motion.div>

      <motion.div
        className="wrap"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <div className={styles.console}>
          <div className={styles.topBar}>
            <span className={styles.live}><i/>Live</span>
            <span className={styles.ecg}>
              <svg viewBox="0 0 600 26" preserveAspectRatio="none">
                <path className={styles.sweep} d="M0 13 L210 13 L228 13 L238 3 L250 23 L262 1 L274 21 L284 13 L360 13 L378 13 L386 7 L394 13 L600 13"/>
              </svg>
            </span>
            <span className={styles.coord}>LAT 0.00 · AP 12.4 · FULL TRACT</span>
          </div>
          <div className={styles.prog}>
            <i key={active} className={styles.progRun} style={{'--dwell': `${AUTO_DELAY/1000}s`}}/>
          </div>

          <div className={styles.body}>
            <div className={styles.rail}>
              {[['urology','01','Urology'],['andrology','02','Andrology'],['onco','03','Uro-oncology'],['transplant','04','Renal Transplant']].map(([spec, num, name]) => (
                <div
                  key={spec}
                  className={`${styles.railItem}${active === spec ? ' ' + styles.railActive : ''}`}
                  onClick={() => pick(spec)}
                >
                  <span className={styles.rbar}/>
                  <span className={styles.rnum}>{num}</span>
                  <span className={styles.rname}>{name}</span>
                </div>
              ))}
            </div>

            <div className={styles.stage}>
              <div className={styles.crosshair}/>
              <div className={styles.coords}>
                <span className="tl">+ R0.1</span><span className="tr">+ R0.2</span>
                <span className="bl">+ R0.3</span><span className="br">+ R0.4</span>
              </div>
              <AnimatePresence mode="wait">
                {SPECS.map(spec => spec === active && (
                  <motion.div
                    key={spec}
                    className={styles.stg}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {(() => { const D = diagrams[spec]; return <D/> })()}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className={styles.readout}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.roTag}>{ro.tag}</div>
                  <h3 className={styles.roTitle}>{ro.title}</h3>
                  <div className={styles.roFocus}><b>Focus</b> — {ro.focus.split('\n').map((l, i) => <span key={i}>{l}{i < ro.focus.split('\n').length - 1 && <br/>}</span>)}</div>
                  <p className={styles.roDesc}>{ro.desc}</p>
                  <div className={styles.proc}>{ro.procs.map(p => <span key={p}>{p}</span>)}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
