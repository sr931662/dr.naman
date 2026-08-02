import crypto from 'node:crypto'
import { Router } from 'express'
import { PageView } from '../models/PageView.js'
import { Appointment } from '../models/Appointment.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/respond.js'
import { clientIp } from '../services/audit.service.js'

const router = Router()

/** Rotates daily so a visitor hash cannot be correlated across days. */
const DAILY_SALT = crypto.randomBytes(32).toString('hex')
const today = () => new Date().toISOString().slice(0, 10)

function visitorHash(req) {
  return crypto
    .createHash('sha256')
    .update(`${DAILY_SALT}|${today()}|${clientIp(req)}|${req.get('user-agent') || ''}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * POST /api/analytics/track — cookieless page/event beacon.
 * Always answers 204 so a tracking failure can never surface to a visitor.
 */
router.post('/track', asyncHandler(async (req, res) => {
  const { path: p, event, referrer } = req.body || {}
  res.status(204).end()

  if (!p || typeof p !== 'string') return
  await PageView.create({
    path: p.slice(0, 300),
    type: event ? 'event' : 'page',
    event: event ? String(event).slice(0, 60) : undefined,
    referrer: referrer ? String(referrer).slice(0, 300) : undefined,
    day: today(),
    visitorHash: visitorHash(req),
    device: /mobile|android|iphone/i.test(req.get('user-agent') || '') ? 'mobile' : 'desktop',
  }).catch(() => {})
}))

// ─── Reporting ───────────────────────────────────────────────────────────────

router.use(requireAuth)

router.get('/summary', requirePermission('analytics.read'), asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30))
  const since = new Date(Date.now() - days * 86_400_000)
  const sinceDay = since.toISOString().slice(0, 10)

  const [totals, topPages, byDay, devices, appointments] = await Promise.all([
    PageView.aggregate([
      { $match: { day: { $gte: sinceDay }, type: 'page' } },
      { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: '$visitorHash' } } },
      { $project: { _id: 0, views: 1, visitors: { $size: '$visitors' } } },
    ]),
    PageView.aggregate([
      { $match: { day: { $gte: sinceDay }, type: 'page' } },
      { $group: { _id: '$path', views: { $sum: 1 }, visitors: { $addToSet: '$visitorHash' } } },
      { $project: { path: '$_id', _id: 0, views: 1, visitors: { $size: '$visitors' } } },
      { $sort: { views: -1 } },
      { $limit: 15 },
    ]),
    PageView.aggregate([
      { $match: { day: { $gte: sinceDay }, type: 'page' } },
      { $group: { _id: '$day', views: { $sum: 1 }, visitors: { $addToSet: '$visitorHash' } } },
      { $project: { day: '$_id', _id: 0, views: 1, visitors: { $size: '$visitors' } } },
      { $sort: { day: 1 } },
    ]),
    PageView.aggregate([
      { $match: { day: { $gte: sinceDay }, type: 'page' } },
      { $group: { _id: '$device', views: { $sum: 1 } } },
    ]),
    Appointment.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'spam' } } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
  ])

  const summary = totals[0] || { views: 0, visitors: 0 }
  const leads = appointments[0]?.total || 0

  return ok(res, {
    range: { days, since: sinceDay },
    views: summary.views,
    visitors: summary.visitors,
    appointments: leads,
    conversionRate: summary.visitors ? +((leads / summary.visitors) * 100).toFixed(2) : 0,
    topPages,
    byDay,
    devices: Object.fromEntries(devices.map(d => [d._id || 'unknown', d.views])),
  })
}))

export default router
