import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { RefreshToken } from '../models/RefreshToken.js'
import { PasswordReset } from '../models/PasswordReset.js'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../config/logger.js'
import { sendMail, passwordResetOtp } from './mail.service.js'

const MAX_FAILED_LOGINS = 5
const LOCK_MINUTES = 15

// ─── Password reset tuning ───────────────────────────────────────────────────

const OTP_MINUTES = 10
/** Attempts against the six digits before the reset is burned. */
const OTP_MAX_ATTEMPTS = 5
/** How long the verified ticket lasts — long enough to choose a password. */
const TICKET_MINUTES = 15

/** Surfaced to the client so the resend countdown matches the server's limiter. */
export const RESET_POLICY = {
  otpMinutes: OTP_MINUTES,
  resendSeconds: 60,
}

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

// ─── Password reset by emailed passcode ──────────────────────────────────────

/** Six digits, uniformly drawn. `Math.random` has no business near a credential. */
function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

const normaliseEmail = value => String(value || '').toLowerCase().trim()

/**
 * Starts a reset. Always resolves the same way whether or not the address is
 * on file — the response must not become an account-enumeration oracle.
 *
 * The returned object is for the *server's* logging only; the route sends a
 * fixed message regardless.
 */
export async function requestPasswordReset(email, meta = {}) {
  const address = normaliseEmail(email)
  const user = await User.findOne({ email: address })

  // Deactivated accounts do not get a recovery path — that is the point of
  // deactivating them.
  if (!user || !user.active) {
    await new Promise(r => setTimeout(r, 150))
    logger.info(`Password reset requested for unknown or inactive address: ${address}`)
    return { sent: false }
  }

  // Note: the resend cooldown is enforced by an email-keyed rate limiter on
  // the route, not here. Refusing here would only ever fire for addresses that
  // exist, which would turn this endpoint into an account-enumeration oracle —
  // the very thing the uniform response above is protecting.

  // Only one live reset per account: an older code must stop working the
  // moment a newer one is issued.
  await PasswordReset.deleteMany({ user: user._id })

  const code = generateOtp()
  const reset = await PasswordReset.create({
    user: user._id,
    email: user.email,
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: new Date(Date.now() + OTP_MINUTES * 60_000),
    ip: meta.ip,
    userAgent: meta.userAgent,
  })

  try {
    await sendMail(passwordResetOtp({
      name: user.name,
      email: user.email,
      code,
      minutes: OTP_MINUTES,
    }))
  } catch (err) {
    if (!env.mail.enabled && !env.isProd) {
      // Local development with no SMTP configured: hand the code back instead
      // of making the flow impossible to exercise. The record has to stay —
      // deleting it here would leave a code that can never be verified.
      logger.warn(`[dev] SMTP disabled — password reset code for ${user.email} is ${code}`)
      return { sent: false, devCode: code }
    }

    // A genuine delivery failure. The code is unreachable, so drop the record
    // rather than leave a live reset nobody can complete.
    await reset.deleteOne()
    logger.error(`Could not send reset code to ${user.email}: ${err.message}`)
    throw ApiError.internal('We could not send the email just now. Please try again shortly.')
  }

  return { sent: true }
}

/**
 * Trades a correct passcode for a single-use ticket. The six digits are
 * discarded here so they can never be replayed against the reset step.
 */
export async function verifyResetOtp(email, code, meta = {}) {
  const address = normaliseEmail(email)
  const generic = () => ApiError.badRequest('That code is not valid. Check the email and try again.')

  const reset = await PasswordReset.findOne({
    email: address,
    consumedAt: { $exists: false },
  }).sort({ createdAt: -1 }).select('+codeHash')

  if (!reset || !reset.codeHash) throw generic()
  if (reset.isExpired) throw ApiError.badRequest('That code has expired. Please request a new one.')

  if (reset.attempts >= OTP_MAX_ATTEMPTS) {
    throw ApiError.tooMany('Too many incorrect codes. Please request a new one.')
  }

  const okCode = await bcrypt.compare(String(code || '').trim(), reset.codeHash)
  if (!okCode) {
    reset.attempts += 1
    await reset.save()

    const left = OTP_MAX_ATTEMPTS - reset.attempts
    if (left <= 0) {
      logger.warn(`Password reset burned after ${OTP_MAX_ATTEMPTS} bad codes: ${address}`)
      throw ApiError.tooMany('Too many incorrect codes. Please request a new one.')
    }
    throw ApiError.badRequest(
      `That code is not correct. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
    )
  }

  const ticket = crypto.randomBytes(32).toString('hex')
  reset.ticketHash = hashToken(ticket)
  reset.codeHash = undefined
  reset.attempts = 0
  reset.expiresAt = new Date(Date.now() + TICKET_MINUTES * 60_000)
  reset.ip = meta.ip || reset.ip
  await reset.save()

  return { ticket, expiresInMinutes: TICKET_MINUTES }
}

/**
 * Consumes a verified ticket and sets the new password.
 *
 * Also clears any lockout: someone who forgot their password has very likely
 * just tripped the failed-login lock, and leaving it in place would mean a
 * successful reset still could not sign in.
 */
export async function resetPassword(ticket, newPassword) {
  const stale = () => ApiError.badRequest('This reset has expired. Please start again.')

  const raw = String(ticket || '')
  if (!raw) throw stale()

  const reset = await PasswordReset.findOne({
    ticketHash: hashToken(raw),
    consumedAt: { $exists: false },
  }).select('+ticketHash')

  if (!reset) throw stale()
  if (reset.isExpired) throw stale()

  // Validate before consuming, so a weak password does not burn the ticket.
  assertPasswordStrength(newPassword)

  const user = await User.findById(reset.user).select('+passwordHash')
  if (!user || !user.active) throw ApiError.forbidden('This account is no longer available')

  await user.setPassword(newPassword)
  user.failedLogins = 0
  user.lockedUntil = undefined
  await user.save()

  reset.consumedAt = new Date()
  reset.ticketHash = undefined
  await reset.save()

  // Anyone already holding a session on this account is now signed out —
  // if the reset was prompted by a compromise, that is the whole point.
  await revokeAllForUser(user._id)
  logger.info(`Password reset completed for ${user.email}`)

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
