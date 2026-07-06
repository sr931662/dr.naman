import { Helmet } from 'react-helmet-async'
import { SITE_URL, SITE_NAME } from '../config/seo'

// Served as-is from /public (unhashed) so it matches the static og:image in index.html.
const DEFAULT_IMAGE = `${SITE_URL}/social-card.png`

export default function Seo({ title, description, path = '/', image, jsonLd, noindex = false }) {
  const url = `${SITE_URL}${path}`
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const ogImage = image || DEFAULT_IMAGE
  const jsonLdList = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description}/>
      <link rel="canonical" href={url}/>
      {noindex && <meta name="robots" content="noindex, nofollow"/>}

      <meta property="og:type" content="website"/>
      <meta property="og:site_name" content={SITE_NAME}/>
      <meta property="og:title" content={fullTitle}/>
      <meta property="og:description" content={description}/>
      <meta property="og:url" content={url}/>
      <meta property="og:image" content={ogImage}/>
      <meta property="og:locale" content="en_IN"/>

      <meta name="twitter:card" content="summary_large_image"/>
      <meta name="twitter:title" content={fullTitle}/>
      <meta name="twitter:description" content={description}/>
      <meta name="twitter:image" content={ogImage}/>

      {jsonLdList.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  )
}
