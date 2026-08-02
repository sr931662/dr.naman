import { verifyAccessToken } from '../services/auth.service.js'
import { User, can } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function bearer(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null
}

/** Requires a valid access token; attaches `req.user`. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = bearer(req)
  if (!token) throw ApiError.unauthorized('Sign in to continue')

  const payload = verifyAccessToken(token)
  const user = await User.findById(payload.sub)
  if (!user || !user.active) throw ApiError.unauthorized('Account unavailable')

  // A password change or forced logout bumps tokenVersion, retiring old tokens.
  if (payload.tv !== user.tokenVersion) {
    throw ApiError.unauthorized('Session no longer valid. Please sign in again.', { code: 'TOKEN_STALE' })
  }

  req.user = user
  next()
})

/** Attaches `req.user` when a token is present, but never rejects. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = bearer(req)
  if (!token) return next()
  try {
    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)
    if (user?.active && payload.tv === user.tokenVersion) req.user = user
  } catch {
    // An invalid token on an optional route is simply an anonymous request.
  }
  next()
})

/** Gate a route on a capability, e.g. `requirePermission('content.publish')`. */
export const requirePermission = permission => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Sign in to continue'))
  if (!can(req.user, permission)) {
    return next(ApiError.forbidden(`Your role (${req.user.role}) cannot perform this action`))
  }
  next()
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Sign in to continue'))
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to do that'))
  }
  next()
}
