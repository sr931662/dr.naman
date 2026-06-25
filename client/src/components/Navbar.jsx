import { useState, useEffect } from 'react'

const LINKS = [
  ['#expertise', 'Expertise'],
  ['#philosophy', 'Philosophy'],
  ['#journey', 'Journey'],
  ['#voices', 'Voices'],
  ['#contact', 'Contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // close on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 981px)')
    const handler = (e) => { if (e.matches) close() }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav className="nav" id="nav">
        <div className="wrap">
          <a className="brand" href="#top" data-magnetic="0.25" onClick={close}>
            <span className="mono">N</span>
            <span className="bn">Dr. Naman Aggarwal<small>Urology · Transplant</small></span>
          </a>
          <div className="nav-links">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </div>
          <a className="btn btn-primary nav-cta" href="#contact" data-magnetic="0.3">Book a consultation</a>
          <button
            className={`nav-burger${open ? ' open' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-mobile${open ? ' open' : ''}`} aria-hidden={!open}>
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={close}>{label}</a>
        ))}
        <a className="btn btn-primary" href="#contact" onClick={close}>Book a consultation</a>
      </div>
      {open && <div className="nav-overlay" onClick={close} aria-hidden="true"/>}
    </>
  )
}
