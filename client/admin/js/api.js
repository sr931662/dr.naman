/**
 * API client.
 *
 * The access token is deliberately kept in memory only — the long-lived refresh
 * token lives in an httpOnly cookie, so a XSS bug cannot walk off with a
 * durable session. On boot, and whenever a call 401s, we silently refresh.
 */

/**
 * Where the API lives — the same VITE_API_URL the public site uses.
 *
 * This file is compiled by Vite (it lives in client/admin, not client/public),
 * so the variable is inlined at build time. Falls back to a relative "/api",
 * which is correct whenever the API is same-origin.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

let accessToken = null
let refreshing = null

/**
 * The refresh token is normally an httpOnly cookie. When the CMS and the API
 * are on different origins that cookie is third-party — Safari blocks it
 * outright and mobile browsers usually do too, which logs the user out on
 * every reload.
 *
 * So we also keep the server's copy here. The cookie is still sent when it
 * works; this is the fallback that makes sign-in reliable everywhere.
 */
const REFRESH_KEY = 'drn_cms_refresh'

const readRefresh = () => {
  try { return localStorage.getItem(REFRESH_KEY) } catch { return null }
}
const writeRefresh = token => {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token)
    else localStorage.removeItem(REFRESH_KEY)
  } catch {
    // Private browsing can deny storage; the cookie path still applies.
  }
}

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
    // Send the stored token explicitly; the server falls back to the cookie
    // when this is absent, so both deployment shapes work.
    const stored = readRefresh()
    refreshing = raw('/auth/refresh', {
      method: 'POST',
      body: stored ? { refreshToken: stored } : {},
    })
      .then(r => {
        accessToken = r.data.accessToken
        // Rotation means the old token is now dead — always store the new one.
        if (r.data.refreshToken) writeRefresh(r.data.refreshToken)
        return r.data
      })
      .catch(err => {
        // A dead session must not leave a stale token behind, or every future
        // refresh would look like token reuse.
        if (err.status === 401) writeRefresh(null)
        throw err
      })
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
  login: async (email, password) => {
    const res = await raw('/auth/login', { method: 'POST', body: { email, password } })
    if (res.data?.refreshToken) writeRefresh(res.data.refreshToken)
    return res
  },
  refresh: refreshOnce,
  logout: async () => {
    const stored = readRefresh()
    writeRefresh(null)
    accessToken = null
    await raw('/auth/logout', {
      method: 'POST',
      body: stored ? { refreshToken: stored } : {},
    }).catch(() => {})
  },
}

function qs(params) {
  if (!params) return ''
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return clean.length ? `?${new URLSearchParams(clean)}` : ''
}
