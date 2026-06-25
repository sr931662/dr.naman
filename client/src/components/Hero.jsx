export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-aura"></div>
      <svg className="hero-ring" viewBox="0 0 520 520">
        <circle cx="260" cy="260" r="258"/>
        <circle cx="260" cy="260" r="210"/>
        <line className="tick" x1="260" y1="2" x2="260" y2="20"/>
        <line className="tick" x1="260" y1="500" x2="260" y2="518"/>
        <line className="tick" x1="2" y1="260" x2="20" y2="260"/>
        <line className="tick" x1="500" y1="260" x2="518" y2="260"/>
      </svg>
      <div className="hero-photo">
        <image-slot id="doc-hero" shape="rect" fit="cover" position="50% 16%" placeholder="Drag Dr. Aggarwal's portrait here"></image-slot>
      </div>
      <div className="hero-fade"></div>
      <div className="measure">
        <div className="mt">
          <span className="ml">EST · MEDANTA · GURUGRAM</span>
          <span className="ml">N · A · 28.45°N 77.04°E</span>
        </div>
      </div>
      <div className="wrap">
        <div className="hero-copy">
          <span className="eyebrow reveal"><span className="pulse"></span>Urology · Andrology · Uro-oncology · Renal Transplant</span>
          <h1>
            <span className="word">Surgical</span> <span className="word">precision,</span><br/>
            <span className="word">profoundly</span> <span className="word"><em>human</em></span> <span className="word">care.</span>
          </h1>
          <p className="lead reveal d3">Consultant Urologist &amp; Renal Transplant Surgeon at Medanta, Gurugram — uniting robotic, minimally-invasive technique with a calm, deeply personal bedside that patients remember long after they heal.</p>
          <div className="hero-cta reveal d4">
            <a className="btn btn-primary" href="#contact" data-magnetic="0.3">Book a consultation</a>
            <a className="btn btn-ghost" href="#expertise" data-magnetic="0.3">Enter the Atlas <span className="arr">→</span></a>
          </div>
          <div className="hero-stats reveal d5">
            <div className="st"><b>04</b><span>Sub-specialties</span></div>
            <div className="st"><b>ASRM</b><span>Andrology certified</span></div>
            <div className="st"><b>2022</b><span>Devon Fellowship</span></div>
          </div>
        </div>
      </div>
      <div className="scrollcue">Scroll<i></i></div>
    </header>
  )
}
