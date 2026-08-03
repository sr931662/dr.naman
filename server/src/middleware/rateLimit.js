import rateLimit from 'express-rate-limit'
import { ApiError } from '../utils/ApiError.js'

const handler = message => (_req, _res, next) => next(ApiError.tooMany(message))

const base = {
  standardHeaders: true,
  legacyHeaders: false,
}

/** Broad protection for the whole API surface. */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 600,
  handler: handler('Too many requests. Please slow down.'),
})

/** Credential stuffing defence — deliberately strict. */
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: handler('Too many sign-in attempts. Try again in a few minutes.'),
})

/**
 * Reset codes, keyed by the address being reset rather than the caller's IP.
 *
 * Two reasons for the unusual key: an attacker rotating IPs must not be able
 * to flood one person's inbox, and the limit has to apply identically to
 * addresses that do not exist — keyed by IP it would only ever bite on real
 * accounts, which would make the 429 itself an account-enumeration signal.
 *
 * Single-process by design (in-memory store). Behind more than one instance
 * this wants a shared store; the per-account "one live reset" rule in
 * auth.service is what holds the line in the meantime.
 */
export const passwordResetLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 5,
  keyGenerator: req => String(req.body?.email || '').toLowerCase().trim() || req.ip,
  handler: handler('Too many reset codes requested for that address. Please wait a few minutes.'),
})

/** Guessing the six digits. Stricter than login: the search space is smaller. */
export const otpLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 12,
  skipSuccessfulRequests: true,
  handler: handler('Too many attempts. Please request a new code.'),
})

/** The public contact form: generous enough for real patients, hostile to bots. */
export const formLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60_000,
  limit: 8,
  handler: handler('You have sent several requests already. Please call the clinic if it is urgent.'),
})

export const uploadLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 100,
  handler: handler('Upload limit reached. Please wait a few minutes.'),
})
