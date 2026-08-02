/**
 * API client for the public site.
 *
 * The base URL comes from VITE_API_URL, set per environment:
 *
 *   local    →  .env.local            VITE_API_URL=http://localhost:5000/api
 *   preview  →  Vercel dashboard      VITE_API_URL=https://<staging>.run.app/api
 *   prod     →  Vercel dashboard      VITE_API_URL=https://<backend>/api
 *
 * If it is not set we fall back to a relative "/api", which works whenever the
 * backend is reachable on the same origin (the Vite dev proxy, or Express
 * serving the built site). That fallback means a missing variable degrades to
 * same-origin rather than crashing the app.
 *
 * Note: Vite inlines every VITE_* variable into the browser bundle at build
 * time. Only ever put public values here — never a database URI or a secret.
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

/** Where the CMS lives. Only used if you surface a staff-login link. */
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || '/admin'

/** Fails fast in dev if someone points the site at a non-API URL. */
if (import.meta.env.DEV && !/\/api$/.test(API_BASE)) {
  console.warn(
    `[api] VITE_API_URL is "${API_BASE}" — it usually ends in /api. ` +
    'Requests may 404.',
  )
}

export class ApiError extends Error {
  constructor(status, message, details, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.code = code
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    // Network-level failure: offline, DNS, CORS rejection, backend down.
    if (err.name === 'AbortError') throw err
    throw new ApiError(0, 'Could not reach the server. Please check your connection.', null, 'NETWORK')
  }

  if (res.status === 204) return null

  const text = await res.text()
  let payload
  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    throw new ApiError(res.status, 'The server returned an unexpected response.', null, 'BAD_JSON')
  }

  if (!res.ok) {
    const e = payload?.error || {}
    throw new ApiError(res.status, e.message || res.statusText, e.details, e.code)
  }

  return payload.data
}

export const get = (path, opts) => request(path, opts)
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body })

// ─── Endpoints the site uses ────────────────────────────────────────────────

export const getBootstrap = signal => get('/public/bootstrap', { signal })
export const getHome = signal => get('/public/home', { signal })
export const getContactInfo = signal => get('/public/contact', { signal })

export const getTreatments = signal => get('/public/treatments', { signal })
export const getTreatment = (slug, signal) => get(`/public/treatments/${slug}`, { signal })

export const getPosts = signal => get('/public/posts', { signal })
export const getPost = (slug, signal) => get(`/public/posts/${slug}`, { signal })

export const submitAppointment = form => post('/appointments', form)
export const subscribe = email => post('/newsletter/subscribe', { email })

/** Cookieless page-view beacon. Never rejects — analytics must not break a page. */
export function trackPageView(path) {
  try {
    const body = JSON.stringify({ path, referrer: document.referrer })
    const url = `${API_BASE}/analytics/track`

    // sendBeacon survives the page unloading mid-navigation.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      return
    }
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
      .catch(() => {})
  } catch {
    // Analytics is best-effort by design.
  }
}
