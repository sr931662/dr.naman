/**
 * End-to-end smoke test.
 *
 * Boots the real app against an in-memory MongoDB, runs the seeder, and drives
 * the public + authenticated APIs over HTTP the way a browser would. Run with:
 *
 *   node src/scripts/smoke.js
 */
import { MongoMemoryServer } from 'mongodb-memory-server'

let passed = 0
let failed = 0
const failures = []

function check(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    failures.push(name)
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function section(title) {
  console.log(`\n${title}`)
}

async function main() {
  console.log('Starting in-memory MongoDB…')
  const mongo = await MongoMemoryServer.create()

  process.env.MONGODB_URI = mongo.getUri('dr-naman-smoke')
  process.env.NODE_ENV = 'test'
  process.env.PORT = '5199'
  process.env.ADMIN_EMAIL = 'smoke@example.com'
  process.env.ADMIN_PASSWORD = 'SmokeTest1234'
  process.env.LOG_LEVEL = 'error'
  process.env.UPLOAD_DIR = 'uploads-smoke'

  const { connectDB, disconnectDB } = await import('../config/db.js')
  const { createApp } = await import('../app.js')
  const { ensureUploadDir } = await import('../services/media.service.js')

  await connectDB()
  await ensureUploadDir()

  const app = createApp()
  const server = app.listen(5199)
  const BASE = 'http://127.0.0.1:5199'

  let accessToken = null
  let cookie = null

  async function call(path, { method = 'GET', body, auth = true } = {}) {
    const headers = {}
    if (body) headers['Content-Type'] = 'application/json'
    if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`
    if (cookie) headers.Cookie = cookie

    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const setCookie = res.headers.get('set-cookie')
    if (setCookie) cookie = setCookie.split(';')[0]

    const text = await res.text()
    let json
    try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
    return { status: res.status, body: json, text }
  }

  try {
    section('Health')
    const health = await call('/api/health', { auth: false })
    check('GET /api/health returns 200', health.status === 200, `got ${health.status}`)
    check('reports a connected database', health.body?.data?.db === 'connected', health.body?.data?.db)

    section('Seeding')
    const { seed } = await import('../seed/seed.js')
    await seed({ reset: true })
    check('seed script completed', true)

    section('Public delivery API')
    const bootstrap = await call('/api/public/bootstrap', { auth: false })
    check('GET /api/public/bootstrap', bootstrap.status === 200, `got ${bootstrap.status}`)
    check('  · returns site settings', Boolean(bootstrap.body?.data?.settings?.siteName))
    check('  · returns navigation', Array.isArray(bootstrap.body?.data?.navigation?.pageLinks))
    check('  · returns keyed section copy', Boolean(bootstrap.body?.data?.sections?.['home-treatments']))

    const home = await call('/api/public/home', { auth: false })
    check('GET /api/public/home', home.status === 200, `got ${home.status}`)
    const h = home.body?.data || {}
    check(`  · ${h.treatments?.length} treatments`, h.treatments?.length === 12, `got ${h.treatments?.length}`)
    check(`  · ${h.testimonials?.length} testimonials`, h.testimonials?.length === 5, `got ${h.testimonials?.length}`)
    check(`  · ${h.conditions?.length} triage cards`, h.conditions?.length === 6, `got ${h.conditions?.length}`)
    check(`  · ${h.journey?.length} timeline milestones`, h.journey?.length === 5, `got ${h.journey?.length}`)
    check(`  · ${h.reels?.length} reels`, h.reels?.length === 6, `got ${h.reels?.length}`)
    check(`  · ${h.faqs?.length} FAQs`, h.faqs?.length === 8, `got ${h.faqs?.length}`)
    check('  · treatment cards carry SVG icons', h.treatments?.[0]?.icon?.startsWith('<svg'))
    check('  · card payload omits the long clinical body', h.treatments?.[0]?.causes === undefined)

    const detail = await call('/api/public/treatments/kidney-stones', { auth: false })
    check('GET /api/public/treatments/kidney-stones', detail.status === 200, `got ${detail.status}`)
    check('  · has the migrated overview', /pebble-like clump/.test(detail.body?.data?.overview || ''))
    check('  · has 6 treatment options', detail.body?.data?.treatments?.length === 6, `got ${detail.body?.data?.treatments?.length}`)
    check('  · has red-flag symptoms', detail.body?.data?.symptoms?.some(s => s.urgent === true))
    check('  · has 3 FAQs', detail.body?.data?.faqs?.length === 3)
    check('  · includes related treatments', detail.body?.data?.related?.length === 4)

    const post = await call('/api/public/posts/kidney-stones-prevention-treatment', { auth: false })
    check('GET /api/public/posts/:slug', post.status === 200, `got ${post.status}`)
    check('  · migrated 4 body paragraphs', post.body?.data?.paragraphs?.length === 4, `got ${post.body?.data?.paragraphs?.length}`)
    check('  · derived a read time', Boolean(post.body?.data?.readTime))

    const contact = await call('/api/public/contact', { auth: false })
    check('GET /api/public/contact', contact.status === 200)
    check(`  · ${contact.body?.data?.locations?.length} clinic locations`, contact.body?.data?.locations?.length === 3)

    const noDrafts = await call('/api/public/settings', { auth: false })
    check('public reads strip editorial metadata', noDrafts.body?.data?.updatedBy === undefined)

    section('SEO')
    const sitemap = await call('/api/seo/sitemap.xml', { auth: false })
    check('GET /api/seo/sitemap.xml', sitemap.status === 200)
    check('  · lists treatment URLs', sitemap.text.includes('/treatments/kidney-stones'))
    check('  · lists blog URLs', sitemap.text.includes('/blog/'))
    const robots = await call('/api/seo/robots.txt', { auth: false })
    check('GET /api/seo/robots.txt disallows /admin', robots.text.includes('Disallow: /admin'))
    const jsonld = await call('/api/seo/jsonld', { auth: false })
    check('GET /api/seo/jsonld emits a Physician block', jsonld.body?.['@type'] === 'Physician')
    const rootSitemap = await call('/sitemap.xml', { auth: false })
    check('GET /sitemap.xml (root alias)', rootSitemap.status === 200, `got ${rootSitemap.status}`)
    const rootRobots = await call('/robots.txt', { auth: false })
    check('GET /robots.txt (root alias)', rootRobots.status === 200, `got ${rootRobots.status}`)

    section('Auth')
    const badLogin = await call('/api/auth/login', {
      method: 'POST', auth: false,
      body: { email: 'smoke@example.com', password: 'wrong-password' },
    })
    check('rejects a wrong password', badLogin.status === 401, `got ${badLogin.status}`)
    check('  · without revealing whether the account exists', /incorrect/i.test(badLogin.body?.error?.message || ''))

    const login = await call('/api/auth/login', {
      method: 'POST', auth: false,
      body: { email: 'smoke@example.com', password: 'SmokeTest1234' },
    })
    check('accepts the correct password', login.status === 200, `got ${login.status}`)
    accessToken = login.body?.data?.accessToken
    check('  · issues an access token', Boolean(accessToken))
    check('  · sets an httpOnly refresh cookie', Boolean(cookie))
    check('  · never returns the password hash', login.body?.data?.user?.passwordHash === undefined)

    const unauth = await call('/api/cms/treatments', { auth: false })
    check('CMS routes reject anonymous requests', unauth.status === 401, `got ${unauth.status}`)

    const me = await call('/api/auth/me')
    check('GET /api/auth/me', me.status === 200)
    check('  · reports the admin role', me.body?.data?.user?.role === 'admin')

    section('CMS CRUD')
    const schema = await call('/api/cms/schema')
    check('GET /api/cms/schema', schema.status === 200)
    check(`  · exposes ${schema.body?.data?.types?.length} content types`, schema.body?.data?.types?.length === 17,
      `got ${schema.body?.data?.types?.length}`)
    check('  · groups them for the sidebar', schema.body?.data?.groups?.length === 5, `got ${schema.body?.data?.groups?.length}`)

    const created = await call('/api/cms/faqs', {
      method: 'POST',
      body: { q: 'Is parking available at the hospital?', a: 'Yes, paid parking is available on site.', category: 'General' },
    })
    check('POST /api/cms/faqs creates a record', created.status === 201, `got ${created.status}`)
    const faqId = created.body?.data?._id
    check('  · defaults to draft', created.body?.data?.status === 'draft', created.body?.data?.status)

    const invalid = await call('/api/cms/faqs', { method: 'POST', body: { q: '' } })
    check('rejects an invalid record with 422', invalid.status === 422, `got ${invalid.status}`)
    check('  · returns field-level errors', Boolean(invalid.body?.error?.details?.q), JSON.stringify(invalid.body?.error?.details))

    const publish = await call(`/api/cms/faqs/${faqId}/status`, { method: 'POST', body: { status: 'published' } })
    check('publishing sets status + publishedAt', publish.body?.data?.status === 'published' && Boolean(publish.body?.data?.publishedAt))

    const slugTest = await call('/api/cms/posts', {
      method: 'POST',
      body: { title: 'When Should You See a Urologist?', excerpt: 'Slug generation test.' },
    })
    check('auto-generates a slug from the title',
      slugTest.body?.data?.slug === 'when-should-you-see-a-urologist',
      slugTest.body?.data?.slug)

    const slugClash = await call('/api/cms/posts', {
      method: 'POST',
      body: { title: 'When Should You See a Urologist?', excerpt: 'Same title again.' },
    })
    check('  · de-duplicates a clashing slug',
      slugClash.body?.data?.slug === 'when-should-you-see-a-urologist-2',
      slugClash.body?.data?.slug)

    const sanitised = await call('/api/cms/posts', {
      method: 'POST',
      body: {
        title: 'XSS probe',
        excerpt: 'Checks HTML sanitisation.',
        body: '<p>Safe text</p><script>alert(1)</script><img src=x onerror=alert(1)>',
      },
    })
    check('strips <script> from rich text', !/<script/i.test(sanitised.body?.data?.body || ''), sanitised.body?.data?.body)
    check('  · strips inline event handlers', !/onerror/i.test(sanitised.body?.data?.body || ''))
    check('  · keeps the legitimate markup', /<p>Safe text<\/p>/.test(sanitised.body?.data?.body || ''))

    const single = await call('/api/cms/settings')
    check('GET a single type without an id', single.status === 200 && Boolean(single.body?.data?.siteName))

    const updated = await call('/api/cms/settings', {
      method: 'PUT',
      body: { ...single.body.data, tagline: 'Updated by the smoke test' },
    })
    check('PUT updates a single type', updated.body?.data?.tagline === 'Updated by the smoke test')

    const cacheBusted = await call('/api/public/bootstrap', { auth: false })
    check('a CMS write invalidates the public cache',
      cacheBusted.body?.data?.settings?.tagline === 'Updated by the smoke test',
      cacheBusted.body?.data?.settings?.tagline)

    const listed = await call('/api/cms/treatments?search=kidney')
    check('list search filters results', listed.body?.data?.length >= 1, `got ${listed.body?.data?.length}`)

    const reorder = await call('/api/cms/treatments/reorder', {
      method: 'POST',
      body: { items: listed.body.data.map((t, i) => ({ id: t._id, order: i + 100 })) },
    })
    check('POST reorder succeeds', reorder.status === 200 && reorder.body?.data?.updated >= 1)

    const duplicated = await call(`/api/cms/faqs/${faqId}/duplicate`, { method: 'POST' })
    check('duplicate creates a draft copy', duplicated.status === 201 && duplicated.body?.data?.status === 'draft')

    const deleted = await call(`/api/cms/faqs/${faqId}`, { method: 'DELETE' })
    check('DELETE removes the record', deleted.status === 200 && deleted.body?.data?.deleted === true)

    section('Contact form')
    const honeypot = await call('/api/appointments', {
      method: 'POST', auth: false,
      body: { name: 'Bot', phone: '9999999999', message: 'spam', website: 'http://spam.example' },
    })
    check('accepts a honeypot submission without revealing it', honeypot.status === 201)

    const enquiry = await call('/api/appointments', {
      method: 'POST', auth: false,
      body: { name: 'Test Patient', phone: '+91 99999 88888', email: 'patient@example.com', message: 'Flank pain for 3 days.' },
    })
    check('POST /api/appointments accepts a real enquiry', enquiry.status === 201, `got ${enquiry.status}`)

    const badEnquiry = await call('/api/appointments', {
      method: 'POST', auth: false,
      body: { name: 'No Phone' },
    })
    check('rejects an incomplete enquiry with 422', badEnquiry.status === 422, `got ${badEnquiry.status}`)

    const inbox = await call('/api/appointments')
    check('GET /api/appointments lists real enquiries only', inbox.body?.data?.length === 1, `got ${inbox.body?.data?.length}`)
    check('  · the honeypot submission is flagged as spam', inbox.body?.meta?.counts?.spam === 1)

    const csv = await call('/api/appointments/export/csv')
    check('CSV export returns rows', csv.status === 200 && csv.text.includes('Test Patient'))

    section('Newsletter & analytics')
    const sub = await call('/api/newsletter/subscribe', {
      method: 'POST', auth: false, body: { email: 'reader@example.com' },
    })
    check('POST /api/newsletter/subscribe', sub.status === 201, `got ${sub.status}`)
    const resub = await call('/api/newsletter/subscribe', {
      method: 'POST', auth: false, body: { email: 'reader@example.com' },
    })
    check('  · a repeat subscribe is idempotent', resub.status === 200)

    const track = await call('/api/analytics/track', {
      method: 'POST', auth: false, body: { path: '/treatments/kidney-stones' },
    })
    check('POST /api/analytics/track returns 204', track.status === 204, `got ${track.status}`)

    await new Promise(r => setTimeout(r, 250)) // the beacon writes after responding
    const summary = await call('/api/analytics/summary')
    check('GET /api/analytics/summary counts the view', summary.body?.data?.views >= 1, `got ${summary.body?.data?.views}`)

    section('Audit trail')
    const activity = await call('/api/cms/activity')
    check('GET /api/cms/activity records changes', activity.body?.data?.length > 0, `got ${activity.body?.data?.length}`)
    check('  · captured the login', activity.body?.data?.some(a => a.action === 'login'))
    check('  · captured a publish', activity.body?.data?.some(a => a.action === 'publish'))

    section('Session lifecycle')
    const refreshed = await call('/api/auth/refresh', { method: 'POST', auth: false })
    check('POST /api/auth/refresh rotates the session', refreshed.status === 200 && Boolean(refreshed.body?.data?.accessToken))
    const oldToken = accessToken
    accessToken = refreshed.body.data.accessToken
    check('  · issues a different access token', accessToken !== oldToken)

    const loggedOut = await call('/api/auth/logout', { method: 'POST' })
    check('POST /api/auth/logout succeeds', loggedOut.status === 200)

    section('Admin UI assets')
    const adminPage = await fetch(`${BASE}/admin/`)
    check('GET /admin/ serves the CMS shell', adminPage.status === 200)
    const adminJs = await fetch(`${BASE}/admin/js/app.js`)
    check('GET /admin/js/app.js serves the bundle entry', adminJs.status === 200)
    const adminCss = await fetch(`${BASE}/admin/css/admin.css`)
    check('GET /admin/css/admin.css serves the stylesheet', adminCss.status === 200)

    section('Single-origin hosting')
    const { existsSync } = await import('node:fs')
    const path = await import('node:path')
    const { ROOT_DIR } = await import('../config/env.js')
    const hasBuild = existsSync(path.resolve(ROOT_DIR, '..', 'client', 'dist', 'index.html'))

    if (hasBuild) {
      const root = await fetch(`${BASE}/`)
      check('GET / serves the public React site', root.status === 200)
      const deep = await fetch(`${BASE}/treatments/kidney-stones`)
      check('  · SPA deep links fall back to index.html', deep.status === 200)
      const deepHtml = await deep.text()
      check('  · and return the app shell, not JSON', deepHtml.includes('<div id="root"'))
    } else {
      console.log('  · skipped (no client build — run `npm run build` in client/)')
    }

    // This must hold whether or not the site is built: reserved prefixes are
    // never swallowed by the SPA catch-all.
    const apiMiss = await call('/api/definitely-not-a-route', { auth: false })
    check('unknown /api path 404s as JSON, not the SPA shell',
      apiMiss.status === 404 && apiMiss.body?.success === false,
      `got ${apiMiss.status}`)
    const uploadMiss = await fetch(`${BASE}/uploads/nope.png`)
    check('missing /uploads file 404s rather than serving the SPA', uploadMiss.status === 404, `got ${uploadMiss.status}`)

    section('Error handling')
    const missing = await call('/api/public/treatments/does-not-exist', { auth: false })
    check('unknown slug returns 404', missing.status === 404, `got ${missing.status}`)
    const badType = await call('/api/public/appointments', { auth: false })
    check('non-public content types are not readable', badType.status === 404, `got ${badType.status}`)
  } finally {
    server.close()
    await disconnectDB()
    await mongo.stop()
  }

  console.log(`\n${'─'.repeat(56)}`)
  console.log(`${passed} passed, ${failed} failed`)
  if (failed) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  · ${f}`)
  }
  process.exit(failed ? 1 : 0)
}

main().catch(err => {
  console.error('\nSmoke run crashed:', err)
  process.exit(1)
})
