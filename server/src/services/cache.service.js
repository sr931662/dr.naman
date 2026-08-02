import { logger } from '../config/logger.js'

/**
 * A deliberately small in-process cache for the public delivery API.
 *
 * The site's read volume is modest and its content changes only when an editor
 * saves, so an in-memory TTL map removes almost all repeat database work
 * without adding Redis as an operational dependency. If this ever runs on more
 * than one instance, swap the three functions below for a shared store —
 * nothing else needs to change.
 */
const store = new Map()

export async function cached(key, ttlSeconds, producer) {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value

  const value = await producer()
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 })
  return value
}

export function invalidate(prefix) {
  let n = 0
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) { store.delete(key); n++ }
  }
  if (n) logger.debug(`Cache: invalidated ${n} entr${n === 1 ? 'y' : 'ies'} for "${prefix}"`)
  return n
}

export function invalidateAll() {
  const n = store.size
  store.clear()
  logger.debug(`Cache: cleared ${n} entries`)
  return n
}

export function cacheStats() {
  const now = Date.now()
  return {
    entries: store.size,
    live: [...store.values()].filter(v => v.expires > now).length,
  }
}

// Evict expired entries periodically so the map cannot grow unbounded.
const sweeper = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expires <= now) store.delete(key)
  }
}, 60_000)
sweeper.unref?.()
