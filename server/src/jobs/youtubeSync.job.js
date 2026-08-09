import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { syncYoutubeReels } from '../services/reelsSync.service.js'

const STARTUP_DELAY_MS = 15_000 // let the DB connection and cache settle first

/**
 * Runs the YouTube Shorts sync once shortly after boot, then on a fixed
 * interval for as long as the process lives. A simple setInterval rather than
 * a cron dependency — "every N hours" doesn't need cron's precision, and this
 * project deliberately keeps its dependency list small.
 */
export function startYoutubeSyncJob() {
  if (!env.youtube.configured) {
    logger.info('[youtube-sync] YOUTUBE_API_KEY / YOUTUBE_CHANNEL_HANDLE not set — automatic Shorts sync is disabled.')
    return
  }

  let running = false
  const run = async () => {
    if (running) return // a manual "Sync now" call may already be in flight
    running = true
    try {
      const result = await syncYoutubeReels()
      logger.info(`[youtube-sync] found ${result.found}, created ${result.created}, updated ${result.updated}, unchanged ${result.unchanged}`)
    } catch (err) {
      logger.error('[youtube-sync] failed:', err.message)
    } finally {
      running = false
    }
  }

  setTimeout(run, STARTUP_DELAY_MS)
  setInterval(run, env.youtube.syncIntervalHours * 60 * 60 * 1000).unref()

  logger.info(`[youtube-sync] enabled — syncing every ${env.youtube.syncIntervalHours}h`)
}
