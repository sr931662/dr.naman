export default function Navbar() {
  return (
    <nav className="nav" id="nav">
      <div className="wrap">
        <a className="brand" href="#top" data-magnetic="0.25">
          <span className="mono">N</span>
          <span className="bn">Dr. Naman Aggarwal<small>Urology · Transplant</small></span>
        </a>
        <div className="nav-links">
          <a href="#expertise">Expertise</a>
          <a href="#philosophy">Philosophy</a>
          <a href="#journey">Journey</a>
          <a href="#voices">Voices</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="btn btn-primary" href="#contact" data-magnetic="0.3">Book a consultation</a>
      </div>
    </nav>
  )
}
