import { Router } from 'express'
import * as content from '../services/content.service.js'
import { getType, hasType } from '../cms/registry.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, paginate } from '../utils/respond.js'
import { ApiError } from '../utils/ApiError.js'
import { cached, invalidateAll } from '../services/cache.service.js'

/**
 * The read-only delivery API the React site consumes.
 *
 * Two invariants hold for every route in this file:
 *   1. drafts are never returned — `publishedOnly: true` is not optional here;
 *   2. editorial metadata (who edited what, when) is stripped before sending.
 */
const router = Router()

/** Content types the public site may read. Anything else 404s. */
const PUBLIC_TYPES = new Set([
  'settings', 'navigation', 'sections', 'pages', 'hero', 'philosophy', 'journey',
  'research', 'credentials', 'reels', 'photos', 'testimonials', 'treatments',
  'conditions', 'faqs', 'posts', 'locations',
])

const STRIP = ['createdBy', 'updatedBy', '__v', 'consentOnRecord']

function clean(doc) {
  if (Array.isArray(doc)) return doc.map(clean)
  if (!doc || typeof doc !== 'object') return doc
  const out = { ...doc }
  for (const key of STRIP) delete out[key]
  return out
}

/** Public content is cacheable — CDNs and browsers may hold it briefly. */
function publicCache(res, seconds = 60) {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=300`)
}

// ─── Aggregate payloads ──────────────────────────────────────────────────────

/**
 * Everything needed to render the shell on any route — one request instead of
 * four on first paint.
 */
router.get('/bootstrap', asyncHandler(async (_req, res) => {
  const data = await cached('public:bootstrap', 60, async () => {
    const [settings, navigation, sections] = await Promise.all([
      content.getSingle('settings'),
      content.getSingle('navigation'),
      content.list('sections', { limit: 200, publishedOnly: true, sort: 'order' }),
    ])
    return {
      settings: clean(settings),
      navigation: clean(navigation),
      sections: keyBy(clean(sections.items), 'key'),
    }
  })
  publicCache(res)
  return ok(res, data)
}))

/** The entire home page in a single round trip. */
router.get('/home', asyncHandler(async (_req, res) => {
  const data = await cached('public:home', 60, async () => {
    const collections = ['philosophy', 'journey', 'research', 'credentials', 'reels', 'photos', 'testimonials']
    const [hero, ...lists] = await Promise.all([
      content.getSingle('hero'),
      ...collections.map(name => content.list(name, { limit: 100, publishedOnly: true, sort: 'order' })),
      ])

    const [treatments, faqs, posts] = await Promise.all([
      content.list('treatments', { limit: 100, publishedOnly: true, sort: 'order' }),
      content.list('faqs', { limit: 100, publishedOnly: true, sort: 'order', filters: { showOnHome: true } }),
      content.list('posts', { limit: 3, publishedOnly: true, sort: '-publishedAt', filters: { featured: true } }),
    ])

    const conditions = await content.list('conditions', { limit: 50, publishedOnly: true, sort: 'order' })

    const out = { hero: clean(hero) }
    collections.forEach((name, i) => { out[name] = clean(lists[i].items) })

    out.treatments = clean(treatments.items).map(summariseTreatment)
    out.conditions = clean(conditions.items)
    out.faqs = clean(faqs.items)
    out.posts = clean(posts.items).map(summarisePost)
    return out
  })

  publicCache(res)
  return ok(res, data)
}))

/** Contact-page payload: locations plus the contact block from settings. */
router.get('/contact', asyncHandler(async (_req, res) => {
  const data = await cached('public:contact', 120, async () => {
    const [settings, locations] = await Promise.all([
      content.getSingle('settings'),
      content.list('locations', { limit: 50, publishedOnly: true, sort: 'order' }),
    ])
    return {
      contact: settings.contact || {},
      doctor: settings.doctor || {},
      locations: clean(locations.items),
    }
  })
  publicCache(res, 120)
  return ok(res, data)
}))

// ─── Generic content reads ───────────────────────────────────────────────────

router.param('type', (req, _res, next, name) => {
  if (!PUBLIC_TYPES.has(name) || !hasType(name)) {
    return next(ApiError.notFound(`No public content type "${name}"`))
  }
  req.contentType = getType(name)
  next()
})

router.get('/:type', asyncHandler(async (req, res) => {
  const type = req.contentType

  if (type.isSingle) {
    publicCache(res)
    return ok(res, clean(await content.getSingle(type.name)))
  }

  const { page, limit, skip, meta } = paginate(req.query, { defaultLimit: 50, maxLimit: 100 })
  const { items, total } = await content.list(type.name, {
    page,
    limit,
    skip,
    sort: req.query.sort,
    search: req.query.search,
    publishedOnly: true,
    filters: req.query.category ? { category: req.query.category } : {},
  })

  publicCache(res)
  return ok(res, clean(items), meta(total))
}))

router.get('/:type/:slug', asyncHandler(async (req, res) => {
  const type = req.contentType
  if (!type.slugField) throw ApiError.notFound('Not found')

  const doc = await content.getBySlug(type.name, req.params.slug, { publishedOnly: true })

  // Detail pages ship their related content so the client needs no follow-ups.
  const extras = {}
  if (type.name === 'posts') {
    const related = await content.list('posts', {
      limit: 3,
      publishedOnly: true,
      sort: '-publishedAt',
    })
    extras.related = clean(related.items)
      .filter(p => String(p._id) !== String(doc._id))
      .slice(0, 3)
      .map(summarisePost)
  }
  if (type.name === 'treatments') {
    const others = await content.list('treatments', { limit: 100, publishedOnly: true, sort: 'order' })
    extras.related = clean(others.items)
      .filter(t => String(t._id) !== String(doc._id))
      .slice(0, 4)
      .map(summariseTreatment)
  }

  publicCache(res)
  return ok(res, { ...clean(doc), ...extras })
}))

// ─── Cache control (used by the CMS after a publish) ─────────────────────────

export function flushPublicCache() {
  invalidateAll()
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function keyBy(items, key) {
  return Object.fromEntries(items.map(i => [i[key], i]))
}

/** Card-sized treatment — the long clinical body stays on the detail route. */
function summariseTreatment(t) {
  const { title, slug, sub, tag, icon, image, featured, order, keyStat } = t
  return { _id: t._id, title, slug, sub, tag, icon, image, featured, order, keyStat }
}

function summarisePost(p) {
  const { title, slug, excerpt, category, readTime, coverImage, featured, publishedAt } = p
  return { _id: p._id, title, slug, excerpt, category, readTime, coverImage, featured, publishedAt }
}

export default router
