export default function CTA() {
  return (
    <section className="cta" id="contact">
      <div className="wrap">
        <div className="cta-main reveal">
          <span className="eyebrow">Consultations</span>
          <h2>Begin the conversation.</h2>
          <p>Whether you are a patient, a family weighing a transplant, or a physician seeking a referral — Dr. Aggarwal's clinic at Medanta is open to you.</p>
          <div className="hero-cta" style={{marginTop:'36px'}}>
            <a className="btn btn-light" href="#" data-magnetic="0.3">Request an appointment <span className="arr">→</span></a>
          </div>
        </div>
        <div className="cta-side reveal d1">
          <div className="row"><small>Hospital</small><span>Medanta — The Medicity, Gurugram</span></div>
          <div className="row"><small>Institute</small><span>Kidney &amp; Urology Institute</span></div>
          <div className="row"><small>Languages</small><span>English · Hindi · Kannada</span></div>
        </div>
      </div>
    </section>
  )
}
