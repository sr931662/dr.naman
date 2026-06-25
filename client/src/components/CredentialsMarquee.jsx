export default function CredentialsMarquee() {
  const items = (
    <>
      <span className="m"><b>Medanta</b> — The Medicity</span><span className="star">✦</span>
      <span className="m">American Society for <b>Reproductive Medicine</b></span><span className="star">✦</span>
      <span className="m"><b>First IVF</b>, Dubai · Observership</span><span className="star">✦</span>
      <span className="m"><b>Devon</b> Traveling Fellowship</span><span className="star">✦</span>
      <span className="m">Speaker · <b>SIU · UAA · USICON</b></span><span className="star">✦</span>
    </>
  )
  return (
    <section className="marquee" aria-hidden="true">
      <div className="track">
        <div className="item">{items}</div>
        <div className="item">{items}</div>
      </div>
    </section>
  )
}
