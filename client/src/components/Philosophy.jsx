export default function Philosophy() {
  return (
    <section className="section philo" id="philosophy">
      <svg className="philo-glyph" viewBox="0 0 100 130"><use href="#kidney" width="100" height="130"/></svg>
      <div className="wrap">
        <div className="philo-q reveal">
          <span className="eyebrow center">The Philosophy</span>
          <blockquote>"A scan shows me the disease. A conversation shows me the <em>person</em>. I refuse to treat one without the other."</blockquote>
          <cite>— Dr. Naman Aggarwal</cite>
        </div>
        <div className="philo-grid">
          <div className="philo-card reveal d1">
            <div className="pc-n">01</div>
            <h3>Listen deeply</h3>
            <p>A compassionate listener who takes the time to understand every concern — simplifying complex medicine until patients and families feel genuinely informed and assured.</p>
          </div>
          <div className="philo-card reveal d2">
            <div className="pc-n">02</div>
            <h3>Operate precisely</h3>
            <p>At the forefront of robotic and minimally-invasive technique, always seeking the latest evidence-based advances to sharpen outcomes and shorten recovery.</p>
          </div>
          <div className="philo-card reveal d3">
            <div className="pc-n">03</div>
            <h3>Care completely</h3>
            <p>A multidisciplinary approach for complex cases and comorbidities, with an unwavering commitment to confidentiality and the highest standards of ethical practice.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
