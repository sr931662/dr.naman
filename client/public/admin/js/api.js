/**
 * API client.
 *
 * The access token is deliberately kept in memory only — the long-lived refresh
 * token lives in an httpOnly cookie, so a XSS bug cannot walk off with a
 * durable session. On boot, and whenever a call 401s, we silently refresh.
 */

/**
 * Where the API lives. Set by the inline script in index.html.
 *
 * Default "/api" keeps the CMS same-origin with the API, which is strongly
 * preferred: the refresh token is an httpOnly cookie, and same-origin means it
 * is a first-party cookie no browser will block. Pointing this at another
 * origin also requires SameSite=None on the server and working third-party
 * cookies in the visitor's browser.
 */
const API_BASE = (window.__CMS_API__ || '/api').replace(/\/$/, '')

let accessToken = null
let refreshing = null

export const setToken = t => { accessToken = t }
export const getToken = () => accessToken

export class ApiError extends Error {
  constructor(status, message, details, code) {
    super(message)
    this.status = status
    this.details = details
    this.code = code
  }
}

async function raw(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: { ...headers },
  }

  if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`

  if (body !== undefined) {
    if (isForm) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }

  const res = await fetch(`${API_BASE}${path}`, opts)

  if (res.status === 204) return null

  const text = await res.text()
  let payload
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { raw: text } }

  if (!res.ok) {
    const err = payload?.error || {}
    throw new ApiError(res.status, err.message || res.statusText, err.details, err.code)
  }

  return payload
}

/** Refreshes at most once even when several calls 401 simultaneously. */
async function refreshOnce() {
  if (!refreshing) {
    refreshing = raw('/auth/refresh', { method: 'POST' })
      .then(r => { accessToken = r.data.accessToken; return r.data })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

export async function request(path, opts = {}) {
  try {
    return await raw(path, opts)
  } catch (err) {
    const stale = err.status === 401 && ['TOKEN_EXPIRED', 'TOKEN_STALE', 'UNAUTHORIZED'].includes(err.code)
    if (!stale || opts._retried || path.startsWith('/auth/refresh') || path.startsWith('/auth/login')) {
      throw err
    }
    await refreshOnce()
    return raw(path, { ...opts, _retried: true })
  }
}

export const api = {
  get: (p, params) => request(p + qs(params)),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: p => request(p, { method: 'DELETE' }),
  upload: (p, formData) => request(p, { method: 'POST', body: formData, isForm: true }),

  // Auth
  login: (email, password) => raw('/auth/login', { method: 'POST', body: { email, password } }),
  refresh: refreshOnce,
  logout: () => raw('/auth/logout', { method: 'POST' }).catch(() => {}),
}

function qs(params) {
  if (!params) return ''
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return clean.length ? `?${new URLSearchParams(clean)}` : ''
}
