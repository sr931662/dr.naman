import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { BLOGS } from '../data/blogs'
import styles from './BlogPost.module.css'

const ARTICLE_BODY = {
  'kidney-stones-prevention-treatment': [
    "Kidney stones — medically known as nephrolithiasis or urolithiasis — form when minerals and salts crystallise in the kidneys. The most common type, calcium oxalate stones, accounts for nearly 80% of cases. Contributing factors include chronic dehydration, high-sodium or high-protein diets, metabolic conditions such as hyperparathyroidism, and a family history of stone disease.",
    "The cardinal symptom is renal colic: a severe, cramping pain that begins in the flank and radiates to the groin. This occurs as the stone moves through the ureter. Associated symptoms include nausea, vomiting, blood in the urine (haematuria), and an urgency to urinate. Small stones — under 5mm — typically pass spontaneously with adequate hydration and analgesics. Stones between 5–10mm may require medical expulsive therapy or urological intervention.",
    "For stones that do not pass, modern urological surgery offers several options. Retrograde Intrarenal Surgery (RIRS) involves passing a flexible ureteroscope through the natural urinary tract to reach and fragment the stone with a holmium laser. It requires no incisions and allows same-day discharge. Percutaneous Nephrolithotomy (PCNL) is preferred for large or complex stones, and involves creating a small tract directly into the kidney. Shockwave lithotripsy (SWL) is a non-invasive option for select stones in the upper urinary tract.",
    "Prevention is the most underestimated aspect of stone disease management. After a first stone event, 50% of patients will have a recurrence within 5 years without metabolic evaluation and dietary guidance. Key preventive measures include maintaining a urine output of at least 2 litres per day, reducing sodium intake, moderating animal protein, and — contrary to popular belief — maintaining adequate dietary calcium rather than restricting it. A 24-hour urine metabolic panel guides personalised prevention in recurrent stone formers.",
  ],
  'minimally-invasive-urology': [
    "The past two decades have transformed urological surgery from a discipline defined by large incisions and prolonged hospital stays into one of the most minimally invasive fields in all of medicine. The underlying philosophy has shifted: the goal is not merely to remove or repair, but to do so with the least possible disruption to surrounding tissue, the shortest recovery, and the best long-term functional outcome.",
    "Retrograde Intrarenal Surgery (RIRS) uses a flexible ureteroscope — no wider than a pencil tip — passed through the urethra, bladder, and ureter into the kidney. A holmium laser fragments stones to dust. The patient goes home the same day. Compare this to the open nephrolithotomy it replaced: a 20cm flank incision, 5-7 days in hospital, and 4-6 weeks before return to work. The outcomes are equivalent; the experience is not.",
    "Holmium Laser Enucleation of the Prostate (HoLEP) has similarly redefined the management of benign prostatic hyperplasia. It removes the obstructing prostatic tissue with precision and minimal blood loss, regardless of prostate size. Retreatment rates at 10 years post-HoLEP are under 2%, compared to 10-15% for transurethral resection (TURP). Laparoscopic and robotic-assisted approaches are now standard for nephrectomy, pyeloplasty, and prostatectomy — allowing complex reconstructions through 3-5 small ports.",
    "For patients, minimally invasive means different things in different procedures, but the common thread is clear: less pain, less bleeding, shorter hospitalisation, faster return to normal activity, and equivalent or superior outcomes to open surgery. It is not simply a technological preference — it represents the evolution of what good surgical care means.",
  ],
  'male-fertility-myths-reality': [
    "Infertility affects approximately 1 in 6 couples. It is commonly perceived as primarily a female concern — but in 40-50% of all infertility cases, a male factor is identified either as the primary cause or as a contributing factor. This clinical reality is frequently underestimated, both by couples seeking help and, at times, by clinicians who default to female workup before considering andrological evaluation.",
    "A semen analysis remains the cornerstone of male fertility evaluation. However, a 'normal' semen analysis does not exclude male factor infertility, just as an abnormal one does not determine its cause. Azoospermia (complete absence of sperm) may be obstructive — caused by a blockage in the vas deferens or epididymis — or non-obstructive, reflecting impaired sperm production. These require very different treatments: surgical reconstruction in the former, hormonal or surgical sperm retrieval in the latter.",
    "Varicocele — dilated veins within the scrotum — is the most commonly correctable cause of male infertility, present in 15% of the general male population and up to 40% of men presenting with infertility. Microsurgical varicocelectomy has the best outcomes, with natural conception rates of 40-60% at 12 months post-surgery in properly selected patients. Several myths persist: that boxers improve sperm count (evidence is weak), that cycling causes infertility (evidence is very limited), or that male infertility is untreatable. The reality is nuanced and increasingly optimistic.",
    "A structured andrological evaluation — including full history, clinical examination, hormonal panel, scrotal and transrectal ultrasound, and genetic studies where indicated — provides a roadmap for treatment. Most causes of male infertility are either treatable or manageable with assisted reproductive technology such as IVF-ICSI. The first step is evaluation, not assumption.",
  ],
  'enlarged-prostate-holep': [
    "Benign prostatic hyperplasia (BPH) — non-cancerous enlargement of the prostate — is among the most prevalent conditions in men over 50. By age 60, over 50% of men have histological evidence of BPH; by 85, that figure approaches 90%. The prostate surrounds the urethra, and as it enlarges, it compresses the urinary channel, causing lower urinary tract symptoms: slow stream, hesitancy, frequency, nocturia, and a sense of incomplete emptying.",
    "HoLEP — Holmium Laser Enucleation of the Prostate — is widely regarded as the surgical gold standard for BPH, irrespective of prostate size. Using a holmium laser delivered through a resectoscope, the surgeon enucleates the entire obstructing adenoma in distinct anatomical planes. The enucleated tissue is then morcellated and retrieved for histological analysis. The key advantage over TURP is completeness: HoLEP removes more obstructing tissue, resulting in superior urinary flow rates, lower retreatment rates, and durable outcomes.",
    "Clinical data supports HoLEP's durability: retreatment rates at 10 years remain under 2%, compared to 10-15% for TURP. Blood loss is minimal — HoLEP is safely performed in patients on anticoagulants. The procedure is transurethral (no external incisions), catheterisation time is typically 24 hours, and most patients are discharged the following morning. Urinary function improves progressively over 4-8 weeks as post-operative irritative symptoms resolve.",
    "The principal objection to HoLEP historically has been the learning curve — it requires approximately 50-70 cases to achieve proficiency. However, in experienced hands, it represents the most complete and durable surgical treatment for BPH available. All resected tissue is also sent for histology, providing the added benefit of incidental detection of prostate cancer in a proportion of patients.",
  ],
  'renal-transplant-journey': [
    "For patients with end-stage renal disease, a successful kidney transplant is life-transforming — restoring energy, independence, and quality of life that dialysis cannot replicate. The transplant journey begins well before the surgery itself: with a careful medical evaluation, assessment of suitability, and the complex process of identifying a compatible donor.",
    "Living-donor kidney transplantation offers the best outcomes, with a median graft survival of 15-20 years, compared to 10-12 years for deceased-donor grafts. A living donor — ideally a close relative — undergoes an independent medical evaluation to ensure their safety. Laparoscopic donor nephrectomy allows the donor kidney to be retrieved through small key-hole incisions, with most donors discharged within 2-3 days and returning to work within 4 weeks.",
    "The recipient surgery involves placing the donor kidney in the lower abdomen (the iliac fossa), connecting the renal artery and vein to the recipient's iliac vessels, and joining the ureter to the bladder. The patient's own failed kidneys are usually left in place. The new kidney may begin functioning immediately — a moment surgeons describe as deeply satisfying — or may take 1-2 weeks to recover (delayed graft function), particularly with deceased-donor kidneys.",
    "Post-transplant care is lifelong. Immunosuppressive medications prevent rejection but require monitoring for side effects. Routine surveillance of graft function, blood pressure, and medication levels occurs at regular intervals. With modern immunosuppression and close follow-up, acute rejection — once the primary cause of graft loss — is now seen in fewer than 10% of recipients. Patient education about lifestyle, infection prevention, and medication adherence is as important as the surgery itself.",
  ],
  'when-to-see-urologist': [
    "Urology is a specialty that many patients come to only when a problem has become unavoidable. This is understandable — urological symptoms are often private, occasionally embarrassing, and easy to attribute to ageing or stress. But several common symptoms deserve prompt urological evaluation, and early assessment consistently leads to better outcomes.",
    "Blood in the urine (haematuria) is the single symptom that should never be dismissed or waited out. Even one episode of painless haematuria warrants investigation to exclude bladder cancer, kidney cancer, or significant stone disease. Burning or painful urination, particularly recurrent episodes, may indicate infection, urethral stricture, or interstitial cystitis. Any recurrent urinary tract infection in a man, or more than two in six months in a woman, warrants cystoscopy and upper tract imaging.",
    "Lower urinary tract symptoms — poor stream, nocturia, hesitancy, post-void dribbling — in men over 50 are worth addressing. They reduce quality of life, disrupt sleep, and if left unmanaged, can lead to bladder damage or urinary retention. Erectile dysfunction, particularly when new or progressive, may signal cardiovascular disease and deserves a cardiovascular risk assessment alongside urological management.",
    "Testicular pain or a new lump in the testis should prompt urgent scrotal ultrasound. While most scrotal masses are benign — epididymal cysts, hydroceles — testicular cancer is the most common solid malignancy in men aged 15-35, and is highly curable when detected early. Finally, if you have been trying to conceive for more than 12 months without success, a semen analysis is the appropriate first step — not a further delay. The common thread across all of these: earlier is better.",
  ],
}

const FALLBACK_BODY = [
  "Dr. Naman Aggarwal is a Consultant Urologist, Andrologist &amp; Laparoscopic Surgeon at Manipal Hospital, Dwarka, Delhi. He holds MBBS, MS General Surgery, and MCh Urology/Genito-Urinary Surgery with 11 years of overall experience. He is ASRM-certified in andrology and holds the Devon Traveling Fellowship (UK) in advanced laparoscopic and robotic urological surgery.",
  "His clinical practice spans the full spectrum of urological conditions, with particular expertise in minimally invasive techniques including Retrograde Intrarenal Surgery (RIRS) for kidney stones, Holmium Laser Enucleation of the Prostate (HoLEP) for benign prostatic hyperplasia, and laparoscopic approaches for uro-oncological surgery.",
  "If you have questions about your urological health or wish to book a consultation, please use the contact form on this website. Dr. Aggarwal's team will respond within 24 hours.",
]

const CARD_GRADIENTS = [
  'linear-gradient(155deg,#1a0a0e,#3d1020,#5c1a30)',
  'linear-gradient(155deg,#0d0d14,#1a1a2e,#2a2850)',
  'linear-gradient(155deg,#0f1a12,#1a3020,#2a4a2e)',
]

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = BLOGS.find(b => b.slug === slug)
  const related = BLOGS.filter(b => b.slug !== slug).slice(0, 3)
  const body = ARTICLE_BODY[slug] || FALLBACK_BODY

  if (!post) {
    return (
      <main className={styles.page}>
        <div className="wrap" style={{ paddingTop: 180, paddingBottom: 120 }}>
          <h1>Article not found</h1>
          <Link to="/blog" className="btn btn-ghost" style={{ marginTop: 24 }}>← Back to blog</Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}/>
        <div className="wrap">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/blog" className={styles.backLink}>← Back to blog</Link>
            <div className={styles.heroMeta}>
              <span className={styles.catBadge}>{post.category}</span>
              <span className={styles.metaSep}>·</span>
              <span>{post.date}</span>
              <span className={styles.metaSep}>·</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className={styles.heroH1}>{post.title}</h1>
            <p className={styles.heroExcerpt}>{post.excerpt}</p>
            <div className={styles.authorRow}>
              <div className={styles.authorAvatar}>N</div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>Dr. Naman Aggarwal</span>
                <span className={styles.authorTitle}>Consultant Urologist · Manipal Hospital, Dwarka, Delhi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article + Sidebar */}
      <section className={styles.articleSection}>
        <div className="wrap">
          <div className={styles.layout}>
            <motion.article
              className={styles.article}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              {body.map((para, i) => (
                <p key={i} className={styles.para}>{para}</p>
              ))}

              <div className={styles.articleFooter}>
                <div className={styles.authorCard}>
                  <div className={styles.authorCardAvatar}>N</div>
                  <div>
                    <span className={styles.authorCardName}>Dr. Naman Aggarwal</span>
                    <span className={styles.authorCardTitle}>Consultant Urologist, Andrologist &amp; Renal Transplant Surgeon · Manipal Hospital, Dwarka, Delhi</span>
                    <span className={styles.authorCardCreds}>MCh Urology (PGIMER) · Devon Fellow · ASRM Certified</span>
                  </div>
                </div>
              </div>
            </motion.article>

            <motion.aside
              className={styles.sidebar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div className={styles.ctaBox}>
                <div className={styles.ctaBoxIcon}>
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="20" stroke="var(--crimson)" strokeWidth="1.5" opacity=".4"/>
                    <path d="M24 14v20M14 24h20" stroke="var(--crimson)" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Book a consultation</h3>
                <p>Discuss this condition with Dr. Aggarwal at Manipal Hospital, Dwarka, Delhi. Teleconsultation available.</p>
                <Link to="/contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Book now <span className="arr">→</span>
                </Link>
              </div>

              <div className={styles.relatedPosts}>
                <span className={styles.relatedLabel}>Related articles</span>
                {related.map((r, i) => (
                  <Link key={r.slug} to={`/blog/${r.slug}`} className={styles.relatedItem}>
                    <span className={styles.relatedCat}>{r.category}</span>
                    <span className={styles.relatedTitle}>{r.title}</span>
                    <span className={styles.relatedTime}>{r.readTime}</span>
                  </Link>
                ))}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* More posts */}
      <section className={styles.moreSection}>
        <div className="wrap">
          <div className={styles.moreHead}>
            <h2>More from the clinic</h2>
            <Link to="/blog" className="btn btn-ghost">View all <span className="arr">→</span></Link>
          </div>
          <div className={styles.moreGrid}>
            {related.map((r, i) => (
              <motion.article
                key={r.slug}
                className={styles.moreCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              >
                <div className={styles.moreVisual} style={{ background: CARD_GRADIENTS[i] }}>
                  <span className={styles.moreCat}>{r.category}</span>
                </div>
                <div className={styles.moreBody}>
                  <div className={styles.moreMeta}>{r.date} · {r.readTime}</div>
                  <h3><Link to={`/blog/${r.slug}`}>{r.title}</Link></h3>
                  <p>{r.excerpt}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
