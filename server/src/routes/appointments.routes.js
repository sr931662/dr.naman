import { Router } from 'express'
import mongoose from 'mongoose'
import { Appointment, APPOINTMENT_STATUSES } from '../models/Appointment.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { formLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created, paginate } from '../utils/respond.js'
import { ApiError } from '../utils/ApiError.js'
import { audit, clientIp } from '../services/audit.service.js'
import { sendMail, appointmentNotification, appointmentAcknowledgement } from '../services/mail.service.js'
import * as content from '../services/content.service.js'

const router = Router()

// ─── Public submission ───────────────────────────────────────────────────────

/**
 * POST /api/appointments — the contact form.
 *
 * Open to the public, so it is rate limited, honeypot-screened, and returns the
 * same shape whether or not the message was flagged as spam: a bot learns
 * nothing from the response.
 */
router.post('/', formLimiter, asyncHandler(async (req, res) => {
  const { name, phone, email, message, preferredTime, website } = req.body || {}

  const errors = {}
  if (!String(name || '').trim()) errors.name = 'Please enter your name'
  if (!String(phone || '').trim()) errors.phone = 'Please enter a phone number'
  else if (!/^[+0-9()\-.\s]{6,24}$/.test(String(phone).trim())) errors.phone = 'That phone number does not look right'
  if (!String(message || '').trim()) errors.message = 'Please describe your symptoms or reason for consultation'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim())) {
    errors.email = 'That email address does not look right'
  }
  if (Object.keys(errors).length) throw ApiError.validation(errors)

  // `website` is a hidden honeypot input — only bots fill it in.
  const isSpam = Boolean(String(website || '').trim())

  const appointment = await Appointment.create({
    name: String(name).trim().slice(0, 120),
    phone: String(phone).trim().slice(0, 24),
    email: email ? String(email).trim().toLowerCase().slice(0, 160) : undefined,
    message: String(message).trim().slice(0, 4000),
    preferredTime: String(preferredTime || '').slice(0, 80),
    status: isSpam ? 'spam' : 'new',
    source: 'website',
    referrer: req.get('referer'),
    ip: clientIp(req),
    userAgent: req.get('user-agent'),
  })

  if (!isSpam) {
    // Fire-and-forget: a mail failure must not fail the patient's submission.
    Promise.all([
      sendMail(appointmentNotification(appointment.toObject())),
      appointment.email
        ? sendMail(appointmentAcknowledgement(appointment.toObject(), await doctorName()))
        : null,
    ]).catch(() => {})
  }

  return created(res, {
    id: appointment._id,
    message: 'Thank you. Your request has been received — the clinic will contact you within 24 hours.',
  })
}))

// ─── CMS management ──────────────────────────────────────────────────────────

router.use(requireAuth)

router.get('/', requirePermission('appointments.read'), asyncHandler(async (req, res) => {
  const { skip, limit, meta } = paginate(req.query, { defaultLimit: 25 })

  const query = {}
  if (req.query.status && req.query.status !== 'all') query.status = req.query.status
  else if (!req.query.status) query.status = { $ne: 'spam' }

  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ name: rx }, { email: rx }, { phone: rx }, { message: rx }]
  }
  if (req.query.from || req.query.to) {
    query.createdAt = {}
    if (req.query.from) query.createdAt.$gte = new Date(req.query.from)
    if (req.query.to) query.createdAt.$lte = new Date(req.query.to)
  }

  const [items, total, byStatus] = await Promise.all([
    Appointment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email')
      .lean(),
    Appointment.countDocuments(query),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ])

  return ok(res, items, {
    ...meta(total),
    statuses: APPOINTMENT_STATUSES,
    counts: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
  })
}))

router.get('/:id', requirePermission('appointments.read'), asyncHandler(async (req, res) => {
  const doc = await Appointment.findById(req.params.id).populate('assignedTo', 'name email').lean()
  if (!doc) throw ApiError.notFound('Request not found')
  return ok(res, doc)
}))

router.patch('/:id', requirePermission('appointments.write'), asyncHandler(async (req, res) => {
  const doc = await Appointment.findById(req.params.id)
  if (!doc) throw ApiError.notFound('Request not found')

  const { status, assignedTo, scheduledFor, note } = req.body || {}

  if (status !== undefined) {
    if (!APPOINTMENT_STATUSES.includes(status)) {
      throw ApiError.badRequest(`Status must be one of: ${APPOINTMENT_STATUSES.join(', ')}`)
    }
    doc.status = status
    if (status === 'contacted' && !doc.contactedAt) doc.contactedAt = new Date()
  }
  if (assignedTo !== undefined) {
    doc.assignedTo = mongoose.isValidObjectId(assignedTo) ? assignedTo : undefined
  }
  if (scheduledFor !== undefined) {
    doc.scheduledFor = scheduledFor ? new Date(scheduledFor) : undefined
  }
  if (note) {
    doc.notes.push({ text: String(note).slice(0, 2000), author: req.user._id, authorName: req.user.name })
  }

  await doc.save()
  audit(req, { action: 'update', resource: 'appointments', resourceId: doc._id, label: doc.name })
  return ok(res, doc.toJSON())
}))

router.delete('/:id', requirePermission('appointments.write'), asyncHandler(async (req, res) => {
  const doc = await Appointment.findByIdAndDelete(req.params.id)
  if (!doc) throw ApiError.notFound('Request not found')
  audit(req, { action: 'delete', resource: 'appointments', resourceId: doc._id, label: doc.name })
  return ok(res, { deleted: true })
}))

/** CSV export for the clinic's own records. */
router.get('/export/csv', requirePermission('appointments.read'), asyncHandler(async (req, res) => {
  const query = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {}
  const rows = await Appointment.find(query).sort({ createdAt: -1 }).limit(5000).lean()

  const header = ['Received', 'Name', 'Phone', 'Email', 'Preferred time', 'Status', 'Message']
  const csv = [
    header.join(','),
    ...rows.map(r => [
      new Date(r.createdAt).toISOString(),
      r.name, r.phone, r.email || '', r.preferredTime || '', r.status, r.message,
    ].map(csvCell).join(',')),
  ].join('\r\n')

  audit(req, { action: 'export', resource: 'appointments', label: `${rows.length} rows` })
  res.set('Content-Type', 'text/csv; charset=utf-8')
  res.set('Content-Disposition', `attachment; filename="appointments-${new Date().toISOString().slice(0, 10)}.csv"`)
  return res.send(`﻿${csv}`)
}))

/**
 * Wraps a value for CSV and neutralises spreadsheet formula injection — an
 * attacker could otherwise submit `=HYPERLINK(...)` as their name and have it
 * execute when clinic staff open the export.
 */
function csvCell(value) {
  let s = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

async function doctorName() {
  try {
    const settings = await content.getSingle('settings')
    return settings?.doctor?.name || 'Dr. Naman Aggarwal'
  } catch {
    return 'Dr. Naman Aggarwal'
  }
}

export default router
