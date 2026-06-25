export default function Research() {
  const talks = [
    { n: '01', t: "Invited speaker — Société Internationale d'Urologie (SIU)", meta: 'International', delay: '' },
    { n: '02', t: 'Speaker — Urological Association of Asia (UAA)', meta: 'International', delay: 'd1' },
    { n: '03', t: 'Speaker — USICON, Urological Society of India', meta: 'National', delay: 'd2' },
    { n: '04', t: 'Active participant — regional & national conferences', meta: 'Ongoing', delay: 'd3' },
  ]
  const conf = <><span className="c"><b>SIU</b> · <b>UAA</b> · <b>USICON</b> · <b>KUACON</b> · </span></>
  return (
    <section className="section research" id="research">
      <div className="wrap">
        <div className="research-top">
          <div className="reveal"><span className="eyebrow">On the Podium</span><h2>Research &amp; talks</h2></div>
          <p className="reveal d1">A regular voice at international and national urological forums — sharing technique, evidence and outcomes with the wider surgical community.</p>
        </div>
        <div className="research-list">
          {talks.map(r => (
            <div key={r.n} className={`ri reveal${r.delay?' '+r.delay:''}`}>
              <span className="rn">{r.n}</span>
              <span className="rt">{r.t}</span>
              <span className="rmeta">{r.meta}</span>
            </div>
          ))}
        </div>
        <div className="conf-marquee" aria-hidden="true">
          <div className="track">
            {conf}{conf}{conf}
          </div>
        </div>
      </div>
    </section>
  )
}
