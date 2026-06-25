import { useEffect, useRef } from 'react'

export default function Preloader() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const timer = setTimeout(() => {
      el.classList.add('done')
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el) }, 900)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div id="preloader" ref={ref}>
      <div className="pl-wipe"></div>
      <div className="pl-in">
        <div className="pl-mono">N</div>
        <svg className="pl-ecg" viewBox="0 0 240 60">
          <path d="M0 30 L70 30 L86 30 L96 12 L108 48 L120 6 L132 44 L142 30 L160 30 L172 30 L180 22 L188 30 L240 30"/>
        </svg>
        <div className="pl-name">Dr. Naman Aggarwal · Medanta</div>
      </div>
    </div>
  )
}
