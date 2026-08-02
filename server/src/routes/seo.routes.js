import { Router } from 'express'
import * as content from '../services/content.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { cached } from '../services/cache.service.js'

/**
 * Generates robots.txt and sitemap.xml from live content, so a newly published
 * article or treatment page is discoverable without editing a static file.
 */
const router = Router()

router.get('/sitemap.xml', asyncHandler(async (_req, res) => {
  const xml = await cached('public:sitemap', 600, async () => {
    const settings = await content.getSingle('settings')
    const base = (settings.siteUrl || 'https://drnamanaggarwal.com').replace(/\/$/, '')

    const [treatments, posts, pages] = await Promise.all([
      content.list('treatments', { limit: 500, publishedOnly: true }),
      content.list('posts', { limit: 500, publishedOnly: true }),
      content.list('pages', { limit: 200, publishedOnly: true }),
    ])

    const urls = [
      { loc: `${base}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${base}/about`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${base}/contact`, priority: '0.9', changefreq: 'monthly' },
      { loc: `${base}/blog`, priority: '0.8', changefreq: 'weekly' },
      ...treatments.items.map(t => ({
        loc: `${base}/treatments/${t.slug}`,
        lastmod: iso(t.updatedAt),
        priority: '0.9',
        changefreq: 'monthly',
      })),
      ...posts.items.map(p => ({
        loc: `${base}/blog/${p.slug}`,
        lastmod: iso(p.updatedAt || p.publishedAt),
        priority: '0.7',
        changefreq: 'monthly',
      })),
      ...pages.items
        .filter(p => !p.seo?.noindex)
        .map(p => ({ loc: `${base}/${p.slug}`, lastmod: iso(p.updatedAt), priority: '0.6' })),
    ]

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(u => [
        '  <url>',
        `    <loc>${escapeXml(u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : '',
        u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : '',
        u.priority ? `    <priority>${u.priority}</priority>` : '',
        '  </url>',
      ].filter(Boolean).join('\n')),
      '</urlset>',
    ].join('\n')
  })

  res.set('Content-Type', 'application/xml; charset=utf-8')
  res.set('Cache-Control', 'public, max-age=3600')
  return res.send(xml)
}))

router.get('/robots.txt', asyncHandler(async (_req, res) => {
  const settings = await content.getSingle('settings')
  const base = (settings.siteUrl || 'https://drnamanaggarwal.com').replace(/\/$/, '')

  res.set('Content-Type', 'text/plain; charset=utf-8')
  return res.send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n'))
}))

/** Structured data for the practice — consumed by the site's <head>. */
router.get('/jsonld', asyncHandler(async (_req, res) => {
  const data = await cached('public:jsonld', 600, async () => {
    const [settings, locations] = await Promise.all([
      content.getSingle('settings'),
      content.list('locations', { limit: 20, publishedOnly: true, sort: 'order' }),
    ])
    const doctor = settings.doctor || {}
    const primary = locations.items.find(l => l.kind === 'primary') || locations.items[0]

    return {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      name: doctor.name,
      jobTitle: doctor.jobTitle,
      medicalSpecialty: doctor.medicalSpecialty,
      url: settings.siteUrl,
      image: doctor.portrait?.url || undefined,
      telephone: settings.contact?.phone || undefined,
      email: settings.contact?.email || undefined,
      address: primary
        ? {
            '@type': 'PostalAddress',
            streetAddress: primary.addressLine,
            addressLocality: primary.city || doctor.addressLocality,
            addressRegion: doctor.addressRegion,
            postalCode: primary.pincode,
            addressCountry: doctor.addressCountry || 'IN',
          }
        : undefined,
      worksFor: doctor.hospital ? { '@type': 'Hospital', name: doctor.hospital } : undefined,
    }
  })

  res.set('Cache-Control', 'public, max-age=600')
  return res.json(data)
}))

function iso(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : undefined
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ))
}

export default router
