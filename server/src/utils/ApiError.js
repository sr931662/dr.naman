export class ApiError extends Error {
  /**
   * @param {number} status  HTTP status code
   * @param {string} message Human-readable message, safe to show a CMS user
   * @param {object} [opts]
   * @param {string} [opts.code]     Machine-readable code, e.g. 'VALIDATION_FAILED'
   * @param {object} [opts.details]  Field-level errors, e.g. { title: 'is required' }
   */
  constructor(status, message, { code, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code || defaultCode(status)
    this.details = details
    this.expected = true
    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(msg = 'Bad request', opts) { return new ApiError(400, msg, opts) }
  static unauthorized(msg = 'Authentication required', opts) { return new ApiError(401, msg, opts) }
  static forbidden(msg = 'You do not have permission to do that', opts) { return new ApiError(403, msg, opts) }
  static notFound(msg = 'Not found', opts) { return new ApiError(404, msg, opts) }
  static conflict(msg = 'Conflict', opts) { return new ApiError(409, msg, opts) }
  static validation(details, msg = 'Validation failed') {
    return new ApiError(422, msg, { code: 'VALIDATION_FAILED', details })
  }
  static tooMany(msg = 'Too many requests', opts) { return new ApiError(429, msg, opts) }
  static internal(msg = 'Something went wrong', opts) { return new ApiError(500, msg, opts) }
}

function defaultCode(status) {
  return {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_FAILED',
    429: 'RATE_LIMITED',
  }[status] || 'INTERNAL_ERROR'
}
