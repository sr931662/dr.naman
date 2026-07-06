import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { TREATMENTS } from '../components/Gallery'
import { TREATMENT_CONTENT } from '../data/treatmentContent'
import Seo from '../components/Seo'
import { SITE_URL, DOCTOR } from '../config/seo'
import styles from './TreatmentDetail.module.css'

export default function TreatmentDetailPage() {
  const { slug } = useParams()
  const [openFaq, setOpenFaq] = useState(null)
  const treatment = TREATMENTS.find(t => t.slug === slug)
  const content = TREATMENT_CONTENT[slug]

  useEffect(() => { setOpenFaq(null) }, [slug])
  const related = TREATMENTS.filter(t => t.slug !== slug).slice(0, 3)

  if (!treatment || !content) {
    return (
      <main className={styles.page}>
        <Seo title="Condition not found" description="This condition page could not be found." path={`/treatments/${slug}`} noindex/>
        <div className="wrap" style={{ paddingTop: 180, paddingBottom: 120 }}>
          <h1>Condition not found</h1>
          <Link to="/#treatments" className="btn btn-ghost" style={{ marginTop: 24 }}>← Back to treatments</Link>
        </div>
      </main>
    )
  }

  const pageUrl = `${SITE_URL}/treatments/${treatment.slug}`
  const medicalJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: treatment.title,
    description: content.overview,
    url: pageUrl,
    lastReviewed: new Date().toISOString().slice(0, 10),
    reviewedBy: { '@type': 'Person', name: DOCTOR.name, jobTitle: DOCTOR.jobTitle },
    about: { '@type': 'MedicalCondition', name: treatment.title },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Treatments', item: `${SITE_URL}/#treatments` },
      { '@type': 'ListItem', position: 3, name: treatment.title, item: pageUrl },
    ],
  }
  const faqJsonLd = content.faqs && content.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  return (
    <main className={styles.page}>
      <Seo
        title={treatment.title}
        description={content.overview}
        path={`/treatments/${treatment.slug}`}
        jsonLd={[medicalJsonLd, breadcrumbJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])]}
      />
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
            <Link to="/#treatments" className={styles.backLink}>← Back to treatments</Link>
            <div className={styles.heroMeta}>
              <span className={styles.catBadge}>{treatment.tag}</span>
            </div>
            <div className={styles.heroIcon}>{treatment.icon}</div>
            <h1 className={styles.heroH1}>{treatment.title}</h1>
            <p className={styles.heroSub}>{treatment.sub}</p>
            {content.keyStat && (
              <div className={styles.heroKeyStat}>
                <span className={styles.heroKeyStatIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 19V10M12 19V5M19 19v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <p className={styles.heroKeyStatText}>{content.keyStat}</p>
              </div>
            )}
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
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Overview</span>
                <p className={styles.para}>{content.overview}</p>
                {content.howCommon && <p className={styles.para}>{content.howCommon}</p>}
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Causes &amp; risk factors</h2>
                <ul className={styles.list}>
                  {content.causes.map((c, i) => <li key={i} className={styles.listItem}>{c}</li>)}
                </ul>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Symptoms to watch for</h2>
                <ul className={styles.list}>
                  {content.symptoms.map((s, i) => (
                    <li key={i} className={`${styles.listItem}${s.urgent ? ' ' + styles.listItemUrgent : ''}`}>
                      {s.urgent ? <strong>{s.text}</strong> : s.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>How it's diagnosed</h2>
                <ul className={styles.list}>
                  {content.diagnosis.map((d, i) => <li key={i} className={styles.listItem}>{d}</li>)}
                </ul>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Treatment options</h2>
                <ul className={styles.list}>
                  {content.treatments.map((t, i) => (
                    <li key={i} className={styles.listItem}><strong>{t.title}:</strong> {t.text}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Outlook &amp; prevention</h2>
                <p className={styles.para}>{content.outlook}</p>
              </div>

              <div className={styles.redFlagBox}>
                <span className={styles.redFlagLabel}>When to see a doctor</span>
                <ul className={styles.list}>
                  {content.seeDoctor.map((s, i) => <li key={i} className={styles.listItem}>{s}</li>)}
                </ul>
              </div>

              {content.faqs && content.faqs.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Quick FAQs</h2>
                  <div className={styles.faqList}>
                    {content.faqs.map((faq, i) => (
                      <div key={i} className={`${styles.faqItem}${openFaq === i ? ' ' + styles.faqItemOpen : ''}`}>
                        <button
                          className={styles.faqQuestion}
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          aria-expanded={openFaq === i}
                        >
                          <span className={styles.faqQText}>{faq.q}</span>
                          <span className={`${styles.faqChevron}${openFaq === i ? ' ' + styles.faqChevronOpen : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </button>
                        <AnimatePresence>
                          {openFaq === i && (
                            <motion.div
                              className={styles.faqAnswer}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <p>{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.articleFooter}>
                <div className={styles.authorCard}>
                  <div className={styles.authorCardAvatar}>N</div>
                  <div>
                    <span className={styles.authorCardName}>Dr. Naman Aggarwal</span>
                    <span className={styles.authorCardTitle}>Consultant Urologist, Andrologist &amp; Renal Transplant Surgeon · Manipal Hospital, Dwarka, Delhi</span>
                    <span className={styles.authorCardCreds}>MCh Urology (PGIMER) · Devon Fellow · ASRM Certified</span>
                  </div>
                </div>
                <p className={styles.disclaimer}>
                  This page is for general education and does not replace a medical consultation. Sources include Mayo Clinic, Cleveland Clinic, NIH/NIDDK, and the Urology Care Foundation (American Urological Association). Always consult a qualified urologist for diagnosis and treatment tailored to you.
                </p>
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
                <p>Discuss {treatment.title.toLowerCase()} with Dr. Aggarwal at Manipal Hospital, Dwarka, Delhi. Teleconsultation available.</p>
                <Link to="/contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Book now <span className="arr">→</span>
                </Link>
              </div>

              {content.keyStat && (
                <div className={styles.factsBox}>
                  <span className={styles.factsLabel}>Key stat</span>
                  <p className={styles.factsStat}>{content.keyStat}</p>
                </div>
              )}

              <div className={styles.relatedPosts}>
                <span className={styles.relatedLabel}>Other conditions treated</span>
                {related.map(r => (
                  <Link key={r.slug} to={`/treatments/${r.slug}`} className={styles.relatedItem}>
                    <span className={styles.relatedTag}>{r.tag}</span>
                    <span className={styles.relatedTitle}>{r.title}</span>
                  </Link>
                ))}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* More treatments */}
      <section className={styles.moreSection}>
        <div className="wrap">
          <div className={styles.moreHead}>
            <h2>More conditions we treat</h2>
            <Link to="/#treatments" className="btn btn-ghost">View all <span className="arr">→</span></Link>
          </div>
          <div className={styles.moreGrid}>
            {related.map((r, i) => (
              <motion.div
                key={r.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              >
                <Link to={`/treatments/${r.slug}`} className={styles.moreCard}>
                  <div className={styles.moreIcon}>{r.icon}</div>
                  <h3>{r.title}</h3>
                  <p>{r.sub}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
