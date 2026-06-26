import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BLOGS } from '../data/blogs'
import styles from './BlogPreview.module.css'

const FEATURED = BLOGS.filter(b => b.featured)

export default function BlogPreview() {
  const [main, ...rest] = FEATURED
  return (
    <section className={styles.section} id="blog">
      <div className="wrap">
        <motion.div
          className={styles.head}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">From the Clinic</span>
          <h2>Insights &amp; <em>education</em></h2>
          <p className="lead">Evidence-based articles and patient guides from Dr. Aggarwal&#39;s practice.</p>
        </motion.div>

        <div className={styles.grid}>
          <motion.div
            className={styles.mainCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.cardVisual}>
              <div className={styles.cardBg}/>
              <span className={styles.categoryTag}>{main.category}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>
                <span>{main.date}</span>
                <span className={styles.metaDot}>·</span>
                <span>{main.readTime}</span>
              </div>
              <h3 className={styles.cardTitle}>
                <Link to={`/blog/${main.slug}`}>{main.title}</Link>
              </h3>
              <p className={styles.cardExcerpt}>{main.excerpt}</p>
              <Link to={`/blog/${main.slug}`} className={styles.readMore}>
                Read article <span>→</span>
              </Link>
            </div>
          </motion.div>

          <div className={styles.sideCards}>
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                className={styles.sideCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (i + 1) * 0.1 }}
              >
                <div className={styles.sideVisual}>
                  <span className={styles.categoryTagSm}>{post.category}</span>
                </div>
                <div className={styles.sideBody}>
                  <div className={styles.cardMeta}>
                    <span>{post.date}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className={styles.sideTitle}>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className={styles.sideExcerpt}>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className={styles.readMore}>
                    Read more <span>→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className={styles.viewAll}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/blog" className="btn btn-ghost">
            View all articles <span className="arr">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
