import mongoose from 'mongoose'
import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export function errorHandler(err, req, res, _next) {
  const normalised = normalise(err)

  if (normalised.status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} →`, err.stack || err.message)
  } else {
    logger.debug(`${req.method} ${req.originalUrl} → ${normalised.status} ${normalised.message}`)
  }

  const body = {
    success: false,
    error: {
      code: normalised.code,
      message: normalised.message,
    },
  }
  if (normalised.details) body.error.details = normalised.details
  if (!env.isProd && normalised.status >= 500) body.error.stack = err.stack

  res.status(normalised.status).json(body)
}

function normalise(err) {
  if (err instanceof ApiError) return err

  // Mongoose schema validation (a backstop — the CMS validator runs first).
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([k, e]) => [k, e.message]),
    )
    return ApiError.validation(details)
  }

  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`"${err.value}" is not a valid ${err.kind}`)
  }

  // Duplicate key — surface which field clashed.
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value'
    return ApiError.conflict(`That ${field} is already in use`, {
      code: 'DUPLICATE_KEY',
      details: { [field]: 'must be unique' },
    })
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? `File is too large (max ${Math.round(env.uploads.maxBytes / 1024 / 1024)} MB)`
      : err.message
    return ApiError.badRequest(message, { code: err.code })
  }

  if (err?.type === 'entity.parse.failed') {
    return ApiError.badRequest('Request body is not valid JSON')
  }

  // Unknown — never leak internals to the client.
  return ApiError.internal(env.isProd ? 'Something went wrong' : err.message)
}
