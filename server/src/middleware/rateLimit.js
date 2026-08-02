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
