import { Router } from 'express'
import * as content from '../services/content.service.js'
import { schemaManifest, getType, allTypes } from '../cms/registry.js'
import { publicSchema, STATUSES } from '../cms/defineType.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created, paginate } from '../utils/respond.js'
import { ApiError } from '../utils/ApiError.js'
import { audit, diff } from '../services/audit.service.js'
import { AuditLog } from '../models/AuditLog.js'
import { syncYoutubeReels } from '../services/reelsSync.service.js'
import { env } from '../config/env.js'

/**
 * One generic router serving every content type. Adding a content type to the
 * registry gives it a full CRUD surface here with no extra route code.
 */
const router = Router()

router.use(requireAuth)

// ─── Schema + dashboard ──────────────────────────────────────────────────────

router.get('/schema', asyncHandler(async (_req, res) => ok(res, schemaManifest())))

router.get('/dashboard', requirePermission('content.read'), asyncHandler(async (_req, res) => {
  const [countsByType, recent] = await Promise.all([
    content.counts(),
    AuditLog.find().sort({ createdAt: -1 }).limit(12).lean(),
  ])
  return ok(res, { counts: countsByType, recentActivity: recent })
}))

router.get('/activity', requirePermission('audit.read'), asyncHandler(async (req, res) => {
  const { skip, limit, meta } = paginate(req.query, { defaultLimit: 50 })
  const query = {}
  if (req.query.resource) query.resource = req.query.resource
  if (req.query.action) query.action = req.query.action

  const [items, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(query),
  ])
  return ok(res, items, meta(total))
}))

// ─── Video Reels — YouTube Shorts sync ────────────────────────────────────────

router.get('/youtube/status', requirePermission('content.read'), asyncHandler(async (_req, res) => {
  return ok(res, {
    configured: env.youtube.configured,
    channelHandle: env.youtube.channelHandle || null,
    syncIntervalHours: env.youtube.syncIntervalHours,
    autoPublish: env.youtube.autoPublish,
  })
}))

/** Manual "Sync now" — the automatic job (server/src/jobs/youtubeSync.job.js) runs this same function on a timer. */
router.post('/youtube/sync', requirePermission('content.write'), asyncHandler(async (req, res) => {
  if (!env.youtube.configured) {
    throw ApiError.badRequest('YouTube sync is not configured — set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_HANDLE on the server')
  }
  const result = await syncYoutubeReels()
  audit(req, {
    action: 'sync',
    resource: 'reels',
    label: `YouTube sync — ${result.created} new, ${result.updated} updated`,
  })
  return ok(res, result)
}))

// ─── Per-type routes ─────────────────────────────────────────────────────────

/** Resolves `:type` once and rejects unknown types with a clean 404. */
router.param('type', (req, _res, next, name) => {
  try {
    req.contentType = getType(name)
    next()
  } catch (err) {
    next(err)
  }
})

router.get('/:type', requirePermission('content.read'), asyncHandler(async (req, res) => {
  const type = req.contentType

  if (type.isSingle) {
    return ok(res, await content.getSingle(type.name), { schema: publicSchema(type) })
  }

  const { page, limit, skip, meta } = paginate(req.query)
  const { items, total } = await content.list(type.name, {
    page,
    limit,
    skip,
    sort: req.query.sort,
    search: req.query.search,
    status: req.query.status,
    filters: parseFilters(req.query.filter),
  })

  return ok(res, items, { ...meta(total), schema: publicSchema(type) })
}))

router.post('/:type', requirePermission('content.write'), asyncHandler(async (req, res) => {
  const type = req.contentType
  const doc = await content.create(type.name, req.body, { userId: req.user._id })
  audit(req, {
    action: 'create',
    resource: type.name,
    resourceId: doc._id,
    label: doc[type.titleField],
  })
  return created(res, doc)
}))

router.get('/:type/:id', requirePermission('content.read'), asyncHandler(async (req, res) => {
  const doc = await content.getById(req.contentType.name, req.params.id)
  return ok(res, doc, { schema: publicSchema(req.contentType) })
}))

router.put('/:type/:id', requirePermission('content.write'), asyncHandler(async (req, res) => {
  const type = req.contentType
  const before = type.isSingle ? await content.getSingle(type.name) : await content.getById(type.name, req.params.id)
  const doc = await content.update(type.name, req.params.id, req.body, {
    userId: req.user._id,
    partial: false,
  })
  audit(req, {
    action: 'update',
    resource: type.name,
    resourceId: doc._id,
    label: doc[type.titleField],
    changes: diff(before, doc),
  })
  return ok(res, doc)
}))

router.patch('/:type/:id', requirePermission('content.write'), asyncHandler(async (req, res) => {
  const type = req.contentType
  const before = await content.getById(type.name, req.params.id)
  const doc = await content.update(type.name, req.params.id, req.body, {
    userId: req.user._id,
    partial: true,
  })
  audit(req, {
    action: 'update',
    resource: type.name,
    resourceId: doc._id,
    label: doc[type.titleField],
    changes: diff(before, doc),
  })
  return ok(res, doc)
}))

/** Single types are edited without an id. */
router.put('/:type', requirePermission('content.write'), asyncHandler(async (req, res) => {
  const type = req.contentType
  if (!type.isSingle) throw ApiError.badRequest('This is a collection — include a record id')

  const before = await content.getSingle(type.name)
  const doc = await content.update(type.name, null, req.body, { userId: req.user._id, partial: false })
  audit(req, {
    action: 'update',
    resource: type.name,
    resourceId: doc._id,
    label: type.label,
    changes: diff(before, doc),
  })
  return ok(res, doc)
}))

router.post('/:type/:id/status', requirePermission('content.publish'), asyncHandler(async (req, res) => {
  const { status } = req.body || {}
  if (!STATUSES.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${STATUSES.join(', ')}`)
  }
  const doc = await content.setStatus(req.contentType.name, req.params.id, status, { userId: req.user._id })
  audit(req, {
    action: status === 'published' ? 'publish' : 'unpublish',
    resource: req.contentType.name,
    resourceId: doc._id,
    label: doc[req.contentType.titleField],
  })
  return ok(res, doc)
}))

router.post('/:type/:id/duplicate', requirePermission('content.write'), asyncHandler(async (req, res) => {
  const doc = await content.duplicate(req.contentType.name, req.params.id, { userId: req.user._id })
  audit(req, {
    action: 'duplicate',
    resource: req.contentType.name,
    resourceId: doc._id,
    label: doc[req.contentType.titleField],
  })
  return created(res, doc)
}))

router.post('/:type/reorder', requirePermission('content.write'), asyncHandler(async (req, res) => {
  const result = await content.reorder(req.contentType.name, req.body?.items, { userId: req.user._id })
  audit(req, { action: 'reorder', resource: req.contentType.name, label: `${result.updated} records` })
  return ok(res, result)
}))

router.post('/:type/bulk-delete', requirePermission('content.delete'), asyncHandler(async (req, res) => {
  const result = await content.bulkRemove(req.contentType.name, req.body?.ids)
  audit(req, { action: 'delete', resource: req.contentType.name, label: `${result.deleted} records` })
  return ok(res, result)
}))

router.delete('/:type/:id', requirePermission('content.delete'), asyncHandler(async (req, res) => {
  const doc = await content.remove(req.contentType.name, req.params.id)
  audit(req, {
    action: 'delete',
    resource: req.contentType.name,
    resourceId: doc._id,
    label: doc[req.contentType.titleField],
  })
  return ok(res, { deleted: true, id: doc._id })
}))

/** `?filter=featured:true,category:Urology` */
function parseFilters(raw) {
  if (!raw) return {}
  return Object.fromEntries(
    String(raw)
      .split(',')
      .map(pair => pair.split(':'))
      .filter(([k, v]) => k && v !== undefined)
      .map(([k, ...rest]) => [k.trim(), rest.join(':').trim()]),
  )
}

export { allTypes }
export default router
