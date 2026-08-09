import { Fragment } from 'react'
import { useContent } from '../lib/ContentProvider'
import styles from './CredentialsMarquee.module.css'

const CREDENTIALS_FALLBACK = [
  { emphasis: 'Manipal Hospital', text: 'Dwarka, Delhi' },
  { text: 'American Society for Reproductive Medicine', emphasis: '' },
  { emphasis: 'First IVF', text: 'Dubai · Observership' },
  { emphasis: 'Devon', text: 'Traveling Fellowship' },
  { text: 'Speaker · ', emphasis: 'SIU · UAA · USICON' },
]

const Items = ({ credentials }) => (
  <div className={styles.item}>
    {credentials.map((c, i) => (
      <Fragment key={i}>
        <span className={styles.m}>
          {c.emphasis && <b>{c.emphasis}</b>}{c.emphasis && c.text ? ' · ' : ''}{c.text}
        </span>
        <span className={styles.star}>•</span>
      </Fragment>
    ))}
  </div>
)

export default function CredentialsMarquee() {
  const { home } = useContent()
  const credentials = home?.credentials?.length ? home.credentials : CREDENTIALS_FALLBACK
  return (
    <section className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        <Items credentials={credentials}/><Items credentials={credentials}/>
      </div>
    </section>
  )
}
