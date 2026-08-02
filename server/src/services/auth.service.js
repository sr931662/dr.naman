import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { RefreshToken } from '../models/RefreshToken.js'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../config/logger.js'

const MAX_FAILED_LOGINS = 5
const LOCK_MINUTES = 15

// ─── Tokens ──────────────────────────────────────────────────────────────────

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      name: user.name,
      tv: user.tokenVersion,
      // A unique id per token: without it, two tokens minted in the same second
      // for the same user are byte-identical, which makes rotation unobservable
      // and would block any future per-token revocation list.
      jti: crypto.randomUUID(),
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessTtl },
  )
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret)
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Your session has expired' : 'Invalid token',
      { code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID' },
    )
  }
}

const hashToken = t => crypto.createHash('sha256').update(t).digest('hex')

async function issueRefreshToken(user, meta = {}) {
  const raw = crypto.randomBytes(48).toString('hex')
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMs(env.jwt.refreshTtl)),
    userAgent: meta.userAgent,
    ip: meta.ip,
  })
  return raw
}

// ─── Flows ───────────────────────────────────────────────────────────────────

export async function login(email, password, meta = {}) {
  const user = await User.findOne({ email: String(email || '').toLowerCase().trim() })
    .select('+passwordHash')

  // A generic message for both branches — never reveal whether an email exists.
  const invalid = () => ApiError.unauthorized('Email or password is incorrect')

  if (!user) {
    // Constant-ish work so response timing doesn't leak account existence.
    await new Promise(r => setTimeout(r, 120))
    throw invalid()
  }
  if (!user.active) throw ApiError.forbidden('This account has been deactivated')
  if (user.isLocked) {
    throw ApiError.tooMany(`Too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString()}.`)
  }

  const okPassword = await user.verifyPassword(String(password || ''))
  if (!okPassword) {
    user.failedLogins += 1
    if (user.failedLogins >= MAX_FAILED_LOGINS) {
      user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000)
      user.failedLogins = 0
      logger.warn(`Account locked after repeated failures: ${user.email}`)
    }
    await user.save()
    throw invalid()
  }

  user.failedLogins = 0
  user.lockedUntil = undefined
  user.lastLoginAt = new Date()
  await user.save()

  const refreshToken = await issueRefreshToken(user, meta)
  return { user: user.toJSON(), accessToken: signAccessToken(user), refreshToken }
}

/**
 * Rotates a refresh token. Presenting an already-revoked token is treated as
 * theft: every session for that user is killed.
 */
export async function rotate(rawToken, meta = {}) {
  if (!rawToken) throw ApiError.unauthorized('No refresh token supplied')

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) })
  if (!stored) throw ApiError.unauthorized('Session not recognised')

  if (stored.revokedAt) {
    logger.warn(`Refresh token reuse detected for user ${stored.user} — revoking all sessions`)
    await revokeAllForUser(stored.user)
    throw ApiError.unauthorized('Session revoked. Please sign in again.')
  }
  if (stored.expiresAt <= new Date()) throw ApiError.unauthorized('Session expired')

  const user = await User.findById(stored.user)
  if (!user || !user.active) throw ApiError.unauthorized('Account unavailable')

  const nextRaw = await issueRefreshToken(user, meta)
  stored.revokedAt = new Date()
  stored.replacedBy = hashToken(nextRaw)
  await stored.save()

  return { user: user.toJSON(), accessToken: signAccessToken(user), refreshToken: nextRaw }
}

export async function logout(rawToken) {
  if (!rawToken) return
  await RefreshToken.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  )
}

export async function revokeAllForUser(userId) {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  )
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } })
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash')
  if (!user) throw ApiError.notFound('User not found')

  const okPassword = await user.verifyPassword(String(currentPassword || ''))
  if (!okPassword) throw ApiError.badRequest('Your current password is incorrect')

  assertPasswordStrength(newPassword)
  await user.setPassword(newPassword)
  await user.save()
  await revokeAllForUser(user._id)

  return user.toJSON()
}

export function assertPasswordStrength(password) {
  const p = String(password || '')
  const problems = []
  if (p.length < 10) problems.push('be at least 10 characters')
  if (!/[a-z]/.test(p)) problems.push('include a lowercase letter')
  if (!/[A-Z]/.test(p)) problems.push('include an uppercase letter')
  if (!/[0-9]/.test(p)) problems.push('include a number')
  if (problems.length) {
    throw ApiError.validation({ password: `Password must ${problems.join(', ')}.` })
  }
}

export function ttlMs(ttl) {
  const m = /^(\d+)\s*([smhd])$/.exec(String(ttl).trim())
  if (!m) return Number(ttl) || 0
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]]
  return Number(m[1]) * mult
}

// ─── Refresh cookie helpers ──────────────────────────────────────────────────

export function setRefreshCookie(res, token) {
  res.cookie(env.cookie.name, token, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    domain: env.cookie.domain,
    path: '/api/auth',
    maxAge: ttlMs(env.jwt.refreshTtl),
  })
}

export function clearRefreshCookie(res) {
  res.clearCookie(env.cookie.name, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    domain: env.cookie.domain,
    path: '/api/auth',
  })
}
