import { Router } from 'express'
import { Subscriber } from '../models/Subscriber.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { formLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created, paginate } from '../utils/respond.js'
import { ApiError } from '../utils/ApiError.js'
import { audit } from '../services/audit.service.js'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

router.post('/subscribe', formLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) throw ApiError.validation({ email: 'Please enter a valid email address' })

  const existing = await Subscriber.findOne({ email })
  if (existing) {
    // Re-subscribing after an unsubscribe is a normal, allowed action.
    if (existing.status === 'unsubscribed') {
      existing.status = 'subscribed'
      existing.unsubscribedAt = undefined
      await existing.save()
    }
    return ok(res, { subscribed: true, message: 'You are on the list.' })
  }

  await Subscriber.create({
    email,
    name: String(req.body?.name || '').trim() || undefined,
    source: req.body?.source || 'website',
    confirmedAt: new Date(),
  })

  return created(res, { subscribed: true, message: 'Thank you for subscribing.' })
}))

/** One-click unsubscribe, reachable from an email footer without signing in. */
router.get('/unsubscribe/:token', asyncHandler(async (req, res) => {
  const sub = await Subscriber.findOne({ token: req.params.token })
  if (!sub) throw ApiError.notFound('This unsubscribe link is no longer valid')

  sub.status = 'unsubscribed'
  sub.unsubscribedAt = new Date()
  await sub.save()

  return ok(res, { unsubscribed: true, email: sub.email })
}))

// ─── CMS management ──────────────────────────────────────────────────────────

router.use(requireAuth)

router.get('/', requirePermission('appointments.read'), asyncHandler(async (req, res) => {
  const { skip, limit, meta } = paginate(req.query, { defaultLimit: 50 })
  const query = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {}

  const [items, total] = await Promise.all([
    Subscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Subscriber.countDocuments(query),
  ])
  return ok(res, items, meta(total))
}))

router.delete('/:id', requirePermission('appointments.write'), asyncHandler(async (req, res) => {
  const doc = await Subscriber.findByIdAndDelete(req.params.id)
  if (!doc) throw ApiError.notFound('Subscriber not found')
  audit(req, { action: 'delete', resource: 'newsletter', resourceId: doc._id, label: doc.email })
  return ok(res, { deleted: true })
}))

router.get('/export/csv', requirePermission('appointments.read'), asyncHandler(async (req, res) => {
  const rows = await Subscriber.find({ status: 'subscribed' }).sort({ createdAt: -1 }).lean()
  const csv = ['Email,Name,Subscribed']
    .concat(rows.map(r => [r.email, r.name || '', new Date(r.createdAt).toISOString()]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')))
    .join('\r\n')

  res.set('Content-Type', 'text/csv; charset=utf-8')
  res.set('Content-Disposition', 'attachment; filename="subscribers.csv"')
  return res.send(`﻿${csv}`)
}))

export default router
