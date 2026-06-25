import { useState } from 'react'

const items = [
  { quote: 'He explained my kidney transplant so calmly that my fear simply dissolved. Months on, I wake up grateful every single morning.', who: 'Transplant recipient', meta: 'Patient testimonial · placeholder' },
  { quote: 'I had seen three specialists before Dr. Aggarwal. He was the first who actually listened — and the first whose treatment worked.', who: 'Urology patient', meta: 'Patient testimonial · placeholder' },
  { quote: 'After years of trying, we became parents. He treated our fertility journey with science, patience and remarkable kindness.', who: 'Andrology patient', meta: 'Patient testimonial · placeholder' },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  return (
    <section className="section testi" id="voices">
      <div className="wrap">
        <div className="testi-head reveal">
          <span className="eyebrow center">In Their Words</span>
          <h2>Voices of patients</h2>
        </div>
        <div className="testi-stage">
          {items.map((item, i) => (
            <div key={i} className={`testi-item${active===i?' active':''}`}>
              <div className="testi-quote-mark">"</div>
              <blockquote>{item.quote}</blockquote>
              <div className="who"><b>{item.who}</b><span>{item.meta}</span></div>
            </div>
          ))}
        </div>
        <div className="testi-dots">
          {items.map((_, i) => (
            <button key={i} className={active===i?'active':''} aria-label={`Testimonial ${i+1}`} onClick={() => setActive(i)}></button>
          ))}
        </div>
      </div>
    </section>
  )
}
