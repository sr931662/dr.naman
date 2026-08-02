import { Router } from 'express'
import * as auth from '../services/auth.service.js'
import { User, ROLES, PERMISSIONS } from '../models/User.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok, created } from '../utils/respond.js'
import { ApiError } from '../utils/ApiError.js'
import { audit, clientIp } from '../services/audit.service.js'
import { env } from '../config/env.js'

const router = Router()

const meta = req => ({ userAgent: req.headers['user-agent'], ip: clientIp(req) })

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) throw ApiError.badRequest('Email and password are required')

  const result = await auth.login(email, password, meta(req))
  auth.setRefreshCookie(res, result.refreshToken)
  audit(req, { action: 'login', resource: 'auth', resourceId: result.user.id, label: result.user.email })

  // The refresh token is also returned in the body, not only as a cookie.
  //
  // The CMS and this API are on different origins, which makes the cookie a
  // third-party cookie — blocked outright by Safari and by most mobile
  // browsers. Without this the user can sign in but is thrown back to the
  // login screen on every reload. The client stores this value and sends it
  // explicitly; the cookie is still set and preferred when same-origin.
  return ok(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.cookie.name] || req.body?.refreshToken
  const result = await auth.rotate(token, meta(req))
  auth.setRefreshCookie(res, result.refreshToken)

  // Rotation issues a new token every time, so the client must be told what it
  // is — otherwise its stored copy is stale and the next refresh looks like
  // token reuse, which deliberately revokes every session.
  return ok(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  await auth.logout(req.cookies?.[env.cookie.name] || req.body?.refreshToken)
  auth.clearRefreshCookie(res)
  return ok(res, { loggedOut: true })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => ok(res, {
  user: req.user.toJSON(),
  permissions: PERMISSIONS[req.user.role] || [],
})))

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const { name, avatar } = req.body || {}
  if (name !== undefined) req.user.name = String(name).trim()
  if (avatar !== undefined) req.user.avatar = String(avatar).trim()
  await req.user.save()
  return ok(res, req.user.toJSON())
}))

router.post('/change-password', requireAuth, authLimiter, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  const user = await auth.changePassword(req.user._id, currentPassword, newPassword)
  auth.clearRefreshCookie(res)
  audit(req, { action: 'password-change', resource: 'auth', resourceId: user.id, label: user.email })
  return ok(res, { user, message: 'Password updated. Please sign in again.' })
}))

// ─── User administration (admin only) ────────────────────────────────────────

router.get('/users', requireAuth, requireRole('admin'), asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  return ok(res, users.map(u => u.toJSON()), { roles: ROLES })
}))

router.post('/users', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, email, password, role = 'editor' } = req.body || {}
  if (!name || !email || !password) throw ApiError.badRequest('Name, email and password are required')
  if (!ROLES.includes(role)) throw ApiError.badRequest(`Role must be one of: ${ROLES.join(', ')}`)

  auth.assertPasswordStrength(password)

  const exists = await User.exists({ email: String(email).toLowerCase().trim() })
  if (exists) throw ApiError.conflict('A user with that email already exists')

  const user = new User({ name: String(name).trim(), email, role })
  await user.setPassword(password)
  await user.save()

  audit(req, { action: 'create', resource: 'users', resourceId: user._id, label: user.email })
  return created(res, user.toJSON())
}))

router.patch('/users/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw ApiError.notFound('User not found')

  const { name, role, active, password } = req.body || {}

  // Guard against an admin locking everyone out of the CMS.
  if ((role && role !== 'admin') || active === false) {
    if (user.role === 'admin') {
      const admins = await User.countDocuments({ role: 'admin', active: true })
      if (admins <= 1) throw ApiError.badRequest('This is the last active admin — promote another user first')
    }
  }

  if (name !== undefined) user.name = String(name).trim()
  if (role !== undefined) {
    if (!ROLES.includes(role)) throw ApiError.badRequest(`Role must be one of: ${ROLES.join(', ')}`)
    user.role = role
  }
  if (active !== undefined) user.active = Boolean(active)
  if (password) {
    auth.assertPasswordStrength(password)
    await user.setPassword(password)
    await auth.revokeAllForUser(user._id)
  }

  await user.save()
  audit(req, { action: 'update', resource: 'users', resourceId: user._id, label: user.email })
  return ok(res, user.toJSON())
}))

router.delete('/users/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    throw ApiError.badRequest('You cannot delete your own account')
  }
  const user = await User.findById(req.params.id)
  if (!user) throw ApiError.notFound('User not found')

  if (user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin', active: true })
    if (admins <= 1) throw ApiError.badRequest('This is the last active admin — promote another user first')
  }

  await user.deleteOne()
  await auth.revokeAllForUser(user._id)
  audit(req, { action: 'delete', resource: 'users', resourceId: user._id, label: user.email })
  return ok(res, { deleted: true })
}))

export default router
