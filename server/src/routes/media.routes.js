import { Router } from 'express'
import multer from 'multer'
import { Media } from '../models/Media.js'
import * as media from '../services/media.service.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { uploadLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created, paginate } from '../utils/respond.js'
import { ApiError } from '../utils/ApiError.js'
import { audit } from '../services/audit.service.js'
import { env } from '../config/env.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploads.maxBytes, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!media.isAllowedMime(file.mimetype)) {
      return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}. Images and PDFs only.`))
    }
    cb(null, true)
  },
})

router.use(requireAuth)

router.get('/', requirePermission('media.read'), asyncHandler(async (req, res) => {
  const { skip, limit, meta } = paginate(req.query, { defaultLimit: 40, maxLimit: 100 })

  const query = {}
  if (req.query.folder && req.query.folder !== 'all') query.folder = req.query.folder
  if (req.query.type === 'image') query.mimeType = { $regex: '^image/' }
  if (req.query.type === 'document') query.mimeType = { $not: { $regex: '^image/' } }
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ originalName: rx }, { alt: rx }, { caption: rx }, { tags: rx }]
  }

  const [items, total, folders] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments(query),
    Media.distinct('folder'),
  ])

  return ok(res, items, { ...meta(total), folders })
}))

router.post('/', requirePermission('media.write'), uploadLimiter, upload.array('files', 10),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) throw ApiError.badRequest('No files were uploaded')

    const uploaded = []
    for (const file of req.files) {
      const doc = await media.store(file, {
        alt: req.body.alt || '',
        caption: req.body.caption || '',
        folder: req.body.folder || 'general',
        tags: req.body.tags,
        userId: req.user._id,
      })
      uploaded.push(doc)
      audit(req, { action: 'upload', resource: 'media', resourceId: doc.id, label: doc.originalName })
    }

    return created(res, uploaded)
  }))

router.patch('/:id', requirePermission('media.write'), asyncHandler(async (req, res) => {
  const doc = await Media.findById(req.params.id)
  if (!doc) throw ApiError.notFound('File not found')

  const { alt, caption, folder, tags } = req.body || {}
  if (alt !== undefined) doc.alt = String(alt)
  if (caption !== undefined) doc.caption = String(caption)
  if (folder !== undefined) doc.folder = String(folder).trim() || 'general'
  if (tags !== undefined) {
    doc.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean)
  }

  await doc.save()
  audit(req, { action: 'update', resource: 'media', resourceId: doc._id, label: doc.originalName })
  return ok(res, doc.toJSON())
}))

router.delete('/:id', requirePermission('media.delete'), asyncHandler(async (req, res) => {
  const doc = await media.destroy(req.params.id)
  if (!doc) throw ApiError.notFound('File not found')
  audit(req, { action: 'delete', resource: 'media', resourceId: doc.id, label: doc.originalName })
  return ok(res, { deleted: true, id: doc.id })
}))

router.get('/usage/:id', requirePermission('media.read'), asyncHandler(async (req, res) => {
  const doc = await Media.findById(req.params.id).lean()
  if (!doc) throw ApiError.notFound('File not found')

  // Scan content collections for records still pointing at this URL, so an
  // editor is warned before deleting an image that is live on the site.
  const { allTypes } = await import('../cms/registry.js')
  const usage = []
  for (const type of allTypes()) {
    const hits = await type.model.find(
      { $text: undefined, ...buildUrlQuery(type, doc.url) },
    ).select(type.titleField).limit(20).lean().catch(() => [])
    for (const hit of hits) {
      usage.push({ type: type.name, label: hit[type.titleField], id: hit._id })
    }
  }

  return ok(res, { media: doc, usage })
}))

function buildUrlQuery(type, url) {
  const imageFields = type.fields.filter(f => f.type === 'image').map(f => `${f.name}.url`)
  if (!imageFields.length) return { _id: null }
  return { $or: imageFields.map(f => ({ [f]: url })) }
}

export default router
