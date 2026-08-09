import * as content from './content.service.js'
import { fetchChannelShorts } from './youtube.service.js'
import { env } from '../config/env.js'

/**
 * Pulls the channel's current Shorts and upserts them into the `reels`
 * collection so the CMS never needs a video entered by hand.
 *
 * Matching is by `sourceId` (the YouTube video ID) first, falling back to
 * `url` for records that predate that field. Once a reel exists, a sync only
 * ever refreshes its view count and backfills `sourceId` if missing — every
 * other field (title, description, thumbnail, order, status) is left alone
 * once a CMS user has had a chance to edit it, so nothing gets silently
 * overwritten.
 */
export async function syncYoutubeReels() {
  if (!env.youtube.configured) {
    return { configured: false, found: 0, created: 0, updated: 0, unchanged: 0 }
  }

  const shorts = await fetchChannelShorts({
    apiKey: env.youtube.apiKey,
    channelHandle: env.youtube.channelHandle,
    maxItems: env.youtube.syncMaxItems,
    maxDurationSeconds: env.youtube.syncMaxDurationSeconds,
  })

  const { items: existing } = await content.list('reels', { limit: 500 })
  const bySourceId = new Map(existing.filter(r => r.sourceId).map(r => [r.sourceId, r]))
  const byUrl = new Map(existing.map(r => [r.url, r]))

  let nextOrder = existing.reduce((max, r) => Math.max(max, r.order ?? -1), -1) + 1

  let created = 0, updated = 0, unchanged = 0

  for (const short of shorts) {
    const match = bySourceId.get(short.sourceId) || byUrl.get(short.url)

    if (match) {
      const patch = {}
      if (match.views !== short.views) patch.views = short.views
      if (!match.sourceId) patch.sourceId = short.sourceId

      if (Object.keys(patch).length === 0) {
        unchanged++
        continue
      }
      await content.update('reels', match._id, patch, { partial: true })
      updated++
      continue
    }

    await content.create('reels', {
      title: short.title,
      desc: short.desc,
      platform: short.platform,
      url: short.url,
      thumbnail: short.thumbnail,
      duration: short.duration,
      views: short.views,
      sourceId: short.sourceId,
      order: nextOrder++,
      status: env.youtube.autoPublish ? 'published' : 'draft',
    })
    created++
  }

  return { configured: true, found: shorts.length, created, updated, unchanged }
}
