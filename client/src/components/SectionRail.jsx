export default function SectionRail() {
  return (
    <nav className="srail" aria-label="Section navigation">
      {[['#top','Top'],['#expertise','Atlas'],['#philosophy','Philosophy'],['#journey','Journey'],['#research','Research'],['#voices','Voices'],['#contact','Contact']].map(([href, label]) => (
        <a key={href} href={href} className={href==='#top'?'active':''}>
          <span className="lbl">{label}</span>
          <span className="pip"></span>
        </a>
      ))}
    </nav>
  )
}
