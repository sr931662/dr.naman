import { ApiError } from '../utils/ApiError.js'

/**
 * Talks to the YouTube Data API v3 to pull a channel's Shorts.
 *
 * There is no "isShort" flag on a video — the API doesn't expose one. The
 * accepted heuristic (what every third-party tool uses) is duration: YouTube
 * extended the Shorts limit from 60s to 3 minutes in late 2024, so anything at
 * or under `maxDurationSeconds` pulled from the channel's uploads is treated
 * as a Short. That playlist mixes Shorts and regular uploads together — there
 * is no separate "Shorts uploads" playlist in the public API — so filtering
 * happens on our side after fetching video details.
 */

const API_BASE = 'https://www.googleapis.com/youtube/v3'

async function get(path, params, apiKey) {
  const url = new URL(`${API_BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('key', apiKey)

  const res = await fetch(url)
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = json?.error?.message || `YouTube API request failed (${res.status})`
    throw new ApiError(502, `YouTube API: ${message}`)
  }
  return json
}


/** Resolves an @handle (or bare channel ID) to its uploads playlist ID. */
async function resolveUploadsPlaylistId(channelHandle, apiKey) {
  const isChannelId = /^UC[\w-]{22}$/.test(channelHandle)
  const params = isChannelId
    ? { part: 'contentDetails', id: channelHandle }
    : { part: 'contentDetails', forHandle: channelHandle.replace(/^@/, '') }

  const json = await get('/channels', params, apiKey)
  const channel = json.items?.[0]
  if (!channel) throw ApiError.notFound(`YouTube channel "${channelHandle}" was not found`)
  return channel.contentDetails.relatedPlaylists.uploads
}

/** Most recent `limit` items from a playlist — just enough info to fetch full video details next. */
async function fetchPlaylistVideoIds(playlistId, limit, apiKey) {
  const ids = []
  let pageToken
  while (ids.length < limit) {
    const json = await get('/playlistItems', {
      part: 'contentDetails',
      playlistId,
      maxResults: Math.min(50, limit - ids.length),
      ...(pageToken ? { pageToken } : {}),
    }, apiKey)
    ids.push(...json.items.map(i => i.contentDetails.videoId))
    pageToken = json.nextPageToken
    if (!pageToken) break
  }
  return ids
}

/** Full details (duration, stats, thumbnails) for a batch of video IDs — the API allows up to 50 per call. */
async function fetchVideoDetails(videoIds, apiKey) {
  const out = []
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const json = await get('/videos', { part: 'snippet,contentDetails,statistics', id: batch.join(',') }, apiKey)
    out.push(...json.items)
  }
  return out
}

/** ISO 8601 duration ("PT1M30S") → whole seconds. */
export function parseIsoDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '')
  if (!m) return 0
  const [, h, min, s] = m
  return (Number(h) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(s) || 0)
}

export function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** 12345 → "12K", 1234567 → "1.2M" — matches the display style already used across the site. */
export function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 < 100_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 < 100 ? 0 : 1)}K`
  return String(n)
}

/**
 * Fetches the channel's most recent uploads and returns the ones short enough
 * to count as Shorts, normalized into the same shape the `reels` CMS type
 * expects (see server/src/cms/types/reels.js).
 */
export async function fetchChannelShorts({ apiKey, channelHandle, maxItems = 20, maxDurationSeconds = 200, scanLimit = 50 }) {
  if (!apiKey || !channelHandle) {
    throw ApiError.badRequest('YouTube sync is not configured — set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_HANDLE')
  }

  const uploadsPlaylistId = await resolveUploadsPlaylistId(channelHandle, apiKey)
  const videoIds = await fetchPlaylistVideoIds(uploadsPlaylistId, scanLimit, apiKey)
  if (!videoIds.length) return []

  const videos = await fetchVideoDetails(videoIds, apiKey)

  return videos
    .map(v => ({ ...v, _durationSeconds: parseIsoDuration(v.contentDetails.duration) }))
    .filter(v => v._durationSeconds > 0 && v._durationSeconds <= maxDurationSeconds)
    .sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt))
    .slice(0, maxItems)
    .map(v => {
      const thumb = v.snippet.thumbnails
      const best = thumb.maxres || thumb.standard || thumb.high || thumb.medium || thumb.default
      return {
        sourceId: v.id,
        title: v.snippet.title,
        desc: (v.snippet.description || '').trim().slice(0, 500),
        platform: 'youtube',
        url: `https://www.youtube.com/shorts/${v.id}`,
        thumbnail: { url: best?.url || '', alt: v.snippet.title },
        duration: formatDuration(v._durationSeconds),
        views: formatViews(Number(v.statistics?.viewCount || 0)),
        publishedAt: v.snippet.publishedAt,
      }
    })
}
