import { AuditLog } from '../models/AuditLog.js'
import { logger } from '../config/logger.js'

/**
 * Records an editorial action. Deliberately fire-and-forget: an audit write
 * failing must never fail the user's actual request.
 */
export function audit(req, { action, resource, resourceId, label, changes }) {
  const entry = {
    user: req.user?._id,
    userName: req.user?.name,
    action,
    resource,
    resourceId: resourceId ? String(resourceId) : undefined,
    label,
    changes,
    ip: clientIp(req),
    userAgent: req.headers['user-agent'],
  }

  AuditLog.create(entry).catch(err => logger.warn('Audit write failed:', err.message))
}

/** A shallow before/after diff, with obvious secrets stripped. */
export function diff(before = {}, after = {}) {
  const changed = {}
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  const SKIP = new Set(['updatedAt', 'createdAt', '_id', 'id', '__v', 'updatedBy', 'createdBy', 'passwordHash'])

  for (const key of keys) {
    if (SKIP.has(key)) continue
    const a = before[key]
    const b = after[key]
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changed[key] = { from: truncate(a), to: truncate(b) }
    }
  }
  return Object.keys(changed).length ? changed : undefined
}

function truncate(value) {
  const s = typeof value === 'string' ? value : JSON.stringify(value ?? null)
  if (s && s.length > 400) return `${s.slice(0, 400)}…`
  return value
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim()
  return req.ip
}
