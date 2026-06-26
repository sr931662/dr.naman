import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BLOGS } from '../data/blogs'
import styles from './Blog.module.css'

const CATS = ['All', 'Patient Education', 'Surgical Advances', 'Andrology', 'Urology', 'Transplant']

const CARD_GRADIENTS = [
  'linear-gradient(155deg,#1a0a0e,#3d1020,#5c1a30)',
  'linear-gradient(155deg,#0d0d14,#1a1a2e,#2a2850)',
  'linear-gradient(155deg,#0f1a12,#1a3020,#2a4a2e)',
  'linear-gradient(155deg,#1a1410,#2e2218,#4a3828)',
  'linear-gradient(155deg,#1a0a0e,#2e0f1c,#4a1428)',
  'linear-gradient(155deg,#0e1218,#192030,#243040)',
]

export default function BlogPage() {
  const [cat, setCat] = useState('All')
  const posts = cat === 'All' ? BLOGS : BLOGS.filter(b => b.category === cat)

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
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Clinical Writing</span>
            <h1 className={styles.heroH1}>Insights from <em>the clinic</em></h1>
            <p className={styles.heroLead}>
              Evidence-based articles, patient guides, and surgical perspectives from Dr. Naman Aggarwal&#39;s urological practice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className={styles.content}>
        <div className="wrap">
          <motion.div
            className={styles.filters}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {CATS.map(c => (
              <button
                key={c}
                className={`${styles.filterBtn} ${cat === c ? styles.filterActive : ''}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </motion.div>

          <div className={styles.grid}>
            {posts.map((post, i) => (
              <motion.article
                key={post.slug}
                className={styles.card}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              >
                <div className={styles.cardVisual} style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}>
                  <span className={styles.catTag}>{post.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.meta}>
                    <span>{post.date}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className={styles.cardTitle}>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className={styles.readLink}>
                    Read article <span>→</span>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {posts.length === 0 && (
            <div className={styles.empty}>No articles in this category yet.</div>
          )}
        </div>
      </section>
    </main>
  )
}
