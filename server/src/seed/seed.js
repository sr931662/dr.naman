import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'

import { connectDB, disconnectDB } from '../config/db.js'
import { env, ROOT_DIR } from '../config/env.js'
import { logger } from '../config/logger.js'
import { getType } from '../cms/registry.js'
import * as content from '../services/content.service.js'
import { User } from '../models/User.js'

import { settings, navigation, hero, sections } from './data/site.js'
import { philosophy, journey, research, credentials, reels, photos, testimonials } from './data/homepage.js'
import { treatmentCards } from './data/treatmentCards.js'
import { conditions } from './data/conditions.js'
import { articleBodies, parsePostDate } from './data/articleBodies.js'
import { locations, pages } from './data/practice.js'

/**
 * Migrates the site's hard-coded content into the CMS.
 *
 * Idempotent by default: existing records (matched on slug/key/title) are left
 * alone, so re-running never overwrites an editor's work. Pass `--reset` to
 * wipe the content collections first.
 *
 *   npm run seed          # fill in anything missing
 *   npm run seed:reset    # start from scratch
 */

let RESET = process.argv.includes('--reset')

/**
 * Three of the largest content sets already live as plain data modules in the
 * client, so they are imported rather than transcribed — that keeps the
 * clinical wording byte-identical to what is on the site today.
 */
async function importFromClient(relativePath, exportName) {
  const abs = path.resolve(ROOT_DIR, '..', 'client/src', relativePath)
  if (!existsSync(abs)) {
    logger.warn(`Client data file not found, skipping: ${relativePath}`)
    return null
  }
  const mod = await import(pathToFileURL(abs).href)
  return mod[exportName] ?? null
}

/**
 * Runs the migration against an already-connected database.
 * Exported so tests (and any future admin action) can seed in-process.
 */
export async function seed({ reset = false } = {}) {
  RESET = reset
  logger.info(`Seeding${RESET ? ' (reset mode)' : ''}`)

  if (RESET) await resetCollections()

  const admin = await ensureAdmin()
  const ctx = { userId: admin?._id }

  // ── Singles ───────────────────────────────────────────────────────────────
  await seedSingle('settings', settings, ctx)
  await seedSingle('navigation', navigation, ctx)
  await seedSingle('hero', hero, ctx)

  // ── Simple collections ────────────────────────────────────────────────────
  await seedCollection('sections', sections, 'key', ctx)
  await seedCollection('philosophy', philosophy, 'title', ctx)
  await seedCollection('journey', journey, 'title', ctx)
  await seedCollection('research', research, 'title', ctx)
  await seedCollection('credentials', credentials, 'text', ctx)
  await seedCollection('reels', reels, 'title', ctx)
  await seedCollection('photos', photos, 'label', ctx)
  await seedCollection('testimonials', testimonials, 'name', ctx)
  await seedCollection('locations', locations, 'name', ctx)
  await seedCollection('pages', pages, 'slug', ctx)

  // ── Treatments: card summary + long-form clinical content ─────────────────
  const treatmentContent = await importFromClient('data/treatmentContent.js', 'TREATMENT_CONTENT') || {}
  const treatments = treatmentCards.map(card => ({
    ...card,
    ...(treatmentContent[card.slug] || {}),
    featured: true,
    lastReviewed: new Date(),
    sources: sourcesFor(card.slug),
  }))
  await seedCollection('treatments', treatments, 'slug', ctx)

  // ── Triage cards, linked to their treatment pages ─────────────────────────
  const treatmentIds = await slugToId('treatments')
  const triage = conditions.map(({ treatmentSlug, ...rest }) => ({
    ...rest,
    treatment: treatmentIds[treatmentSlug],
  }))
  await seedCollection('conditions', triage, 'name', ctx)

  // ── FAQs ──────────────────────────────────────────────────────────────────
  const clientFaqs = await importFromClient('data/faqs.js', 'FAQS') || []
  await seedCollection('faqs', clientFaqs.map(f => ({
    ...f,
    category: categoriseFaq(f.q),
    showOnHome: true,
  })), 'q', ctx)

  // ── Blog posts ────────────────────────────────────────────────────────────
  const clientBlogs = await importFromClient('data/blogs.js', 'BLOGS') || []
  const posts = clientBlogs.map(b => ({
    ...b,
    paragraphs: articleBodies[b.slug] || [],
    publishedAt: parsePostDate(b.date),
    author: 'Dr. Naman Aggarwal',
    medicallyReviewed: true,
  }))
  await seedCollection('posts', posts, 'slug', ctx)

  logger.info('Seed complete.')
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  'settings', 'navigation', 'sections', 'pages', 'hero', 'philosophy', 'journey',
  'research', 'credentials', 'reels', 'photos', 'testimonials', 'treatments',
  'conditions', 'faqs', 'posts', 'locations',
]

async function resetCollections() {
  for (const name of CONTENT_TYPES) {
    const { model } = getType(name)
    const { deletedCount } = await model.deleteMany({})
    if (deletedCount) logger.info(`  cleared ${deletedCount} × ${name}`)
  }
}

async function ensureAdmin() {
  const email = env.admin.email.toLowerCase()
  let user = await User.findOne({ email })
  if (user) return user

  user = new User({ name: env.admin.name, email, role: 'admin' })
  await user.setPassword(env.admin.password)
  await user.save()
  logger.info(`  created admin user: ${email}`)
  logger.warn('  change this password immediately after your first sign-in')
  return user
}

async function seedSingle(typeName, data, ctx) {
  const existing = await getType(typeName).model.findOne({}).lean()
  if (existing && !RESET && hasContent(existing)) {
    logger.info(`  ${typeName}: already configured, skipped`)
    return
  }
  await content.update(typeName, null, { ...data, status: 'published' }, { ...ctx, partial: false })
  logger.info(`  ${typeName}: saved`)
}

async function seedCollection(typeName, items, matchField, ctx) {
  if (!items?.length) {
    logger.warn(`  ${typeName}: no source data, skipped`)
    return
  }

  const type = getType(typeName)
  let inserted = 0
  let skipped = 0

  for (const [index, item] of items.entries()) {
    const matchValue = item[matchField]
    if (matchValue !== undefined) {
      const exists = await type.model.exists({ [matchField]: matchValue })
      if (exists) { skipped++; continue }
    }

    try {
      await content.create(typeName, {
        ...item,
        order: item.order ?? index,
        status: 'published',
      }, ctx)
      inserted++
    } catch (err) {
      // Report and continue — one bad record shouldn't abort the whole migration.
      logger.error(`  ${typeName}[${matchValue ?? index}] failed: ${err.message}`)
      if (err.details) logger.error(`    ${JSON.stringify(err.details)}`)
    }
  }

  logger.info(`  ${typeName}: ${inserted} inserted${skipped ? `, ${skipped} already present` : ''}`)
}

async function slugToId(typeName) {
  const docs = await getType(typeName).model.find({}).select('slug').lean()
  return Object.fromEntries(docs.map(d => [d.slug, d._id]))
}

/** A single type counts as "configured" once it holds more than system fields. */
function hasContent(doc) {
  const meaningful = Object.keys(doc).filter(k => ![
    '_id', 'id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'status', 'publishedAt', 'order',
  ].includes(k))
  return meaningful.some(k => {
    const v = doc[k]
    if (Array.isArray(v)) return v.length > 0
    if (v && typeof v === 'object') return Object.values(v).some(Boolean)
    return Boolean(v)
  })
}

function categoriseFaq(question) {
  const q = question.toLowerCase()
  if (/appointment|book|consultation|bring|second opinion/.test(q)) return 'Appointments'
  if (/recovery|after|discharge/.test(q)) return 'Recovery'
  if (/fertility|infertility|sperm|varicocele/.test(q)) return 'Fertility'
  if (/surgery|surgical|operation|invasive/.test(q)) return 'Surgery'
  return 'General'
}

/** The reference set the original patient-education copy was cross-checked against. */
function sourcesFor() {
  return [
    { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org' },
    { name: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org' },
    { name: 'NIH / NIDDK', url: 'https://www.niddk.nih.gov' },
    { name: 'Urology Care Foundation (AUA)', url: 'https://www.urologyhealth.org' },
  ]
}

/** CLI entry point — owns the database connection lifecycle itself. */
async function runCli() {
  await connectDB()
  try {
    await seed({ reset: process.argv.includes('--reset') })
    logger.info(`Sign in at http://localhost:${env.port}/admin`)
  } finally {
    await disconnectDB()
  }
}

// Only self-execute when invoked directly, not when imported by a test.
const invokedDirectly = process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  runCli().catch(async err => {
    logger.error('Seed failed:', err)
    await disconnectDB().catch(() => {})
    process.exit(1)
  })
}
