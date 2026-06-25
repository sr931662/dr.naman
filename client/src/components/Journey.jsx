import { useEffect, useRef } from 'react'

export default function Journey() {

  const items = [
    { side: 'left', year: 'Certification · ASRM', title: 'Andrology Certification', desc: 'Awarded by the American Society for Reproductive Medicine — formal credentialing in male fertility and reproductive surgery.' },
    { side: 'right', year: 'Observership · Dubai', title: 'First IVF, Dubai (UAE)', desc: 'International observership in advanced reproductive medicine, deepening expertise in andrology and assisted fertility.' },
    { side: 'left', year: '2022 · Fellowship', title: 'Devon Traveling Fellowship', desc: 'A competitive traveling fellowship recognising surgical promise and a commitment to evolving urological practice.' },
    { side: 'right', year: '2022 · Symposium', title: 'KUACON · Davangere PG Symposium', desc: 'Active contribution to the postgraduate urological community through regional academic symposia.' },
    { side: 'left', year: 'Present · Medanta', title: 'Consultant — Medanta, Gurugram', desc: "Practising across urology, andrology, uro-oncology and renal transplantation at one of India's most respected institutions." },
  ]

  const tlRef = useRef(null)

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    const spine = tl.querySelector('.spine')
    const rows = tl.querySelectorAll('.tl-row')

    const nodeIO = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.55 }
    )
    rows.forEach(r => nodeIO.observe(r))

    const onScroll = () => {
      if (!spine) return
      const rect = tl.getBoundingClientRect()
      const visible = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height))
      spine.style.height = `${visible * 100}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      nodeIO.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section className="section timeline-sec" id="journey">
      <div className="wrap tl-head reveal">
        <span className="eyebrow">The Making of a Surgeon</span>
        <h2>Training that crosses<br/>borders &amp; disciplines.</h2>
      </div>
      <div className="wrap">
        <div className="timeline" ref={tlRef}>
          <div className="spine"></div>
          {items.map((item, i) => (
            <div key={i} className="tl-row">
              <div className="tl-node"></div>
              {item.side === 'left' ? (
                <>
                  <div className="tl-card">
                    <div className="tl-year">{item.year}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <div className="tl-spacer"></div>
                </>
              ) : (
                <>
                  <div className="tl-spacer"></div>
                  <div className="tl-card">
                    <div className="tl-year">{item.year}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
