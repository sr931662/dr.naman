import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { env } from '../config/env.js'
import { Media } from '../models/Media.js'
import { logger } from '../config/logger.js'

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'])
const MAX_DIMENSION = 2400
const THUMB_WIDTH = 400

export async function ensureUploadDir() {
  await fs.mkdir(path.join(env.uploads.dir, 'thumbs'), { recursive: true })
}

/**
 * Persists an uploaded buffer.
 *
 * Raster images are re-encoded through sharp, which both normalises them to
 * web-friendly sizes and strips EXIF — clinic photos should not carry GPS
 * coordinates onto a public website.
 */
export async function store(file, { alt = '', caption = '', folder = 'general', tags = [], userId } = {}) {
  await ensureUploadDir()

  const isImage = IMAGE_MIMES.has(file.mimetype)
  const isVector = file.mimetype === 'image/svg+xml'
  const id = crypto.randomBytes(8).toString('hex')
  const safeBase = slugFilename(path.parse(file.originalname).name)

  let buffer = file.buffer
  let ext = path.extname(file.originalname).toLowerCase() || '.bin'
  let width
  let height
  let thumbnailUrl

  if (isImage && !isVector) {
    const image = sharp(file.buffer, { failOn: 'none' })
    const meta = await image.metadata()

    const needsResize = (meta.width || 0) > MAX_DIMENSION
    const pipeline = image.rotate() // honour EXIF orientation before stripping it
    if (needsResize) pipeline.resize({ width: MAX_DIMENSION, withoutEnlargement: true })

    buffer = await pipeline.webp({ quality: 82 }).toBuffer()
    ext = '.webp'

    const outMeta = await sharp(buffer).metadata()
    width = outMeta.width
    height = outMeta.height

    const thumbName = `${safeBase}-${id}-thumb.webp`
    await sharp(file.buffer)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(path.join(env.uploads.dir, 'thumbs', thumbName))
    thumbnailUrl = publicUrl(`thumbs/${thumbName}`)
  }

  const filename = `${safeBase}-${id}${ext}`
  await fs.writeFile(path.join(env.uploads.dir, filename), buffer)

  const doc = await Media.create({
    filename,
    originalName: file.originalname,
    mimeType: isVector ? file.mimetype : isImage ? 'image/webp' : file.mimetype,
    size: buffer.length,
    width,
    height,
    url: publicUrl(filename),
    thumbnailUrl: thumbnailUrl || (isVector ? publicUrl(filename) : undefined),
    storagePath: filename,
    alt,
    caption,
    folder,
    tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map(t => t.trim()).filter(Boolean),
    uploadedBy: userId,
  })

  return doc.toJSON()
}

export async function destroy(id) {
  const doc = await Media.findById(id)
  if (!doc) return null

  await unlinkQuiet(path.join(env.uploads.dir, doc.storagePath))
  if (doc.thumbnailUrl) {
    await unlinkQuiet(path.join(env.uploads.dir, 'thumbs', path.basename(doc.thumbnailUrl)))
  }

  await doc.deleteOne()
  return doc.toJSON()
}

export function publicUrl(relativePath) {
  const base = env.uploads.publicUrl.replace(/\/$/, '')
  return `${base}/uploads/${relativePath}`.replace(/^\/+/, '/')
}

export function isAllowedMime(mime) {
  return IMAGE_MIMES.has(mime) || mime === 'application/pdf'
}

function slugFilename(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file'
}

async function unlinkQuiet(p) {
  try {
    await fs.unlink(p)
  } catch (err) {
    if (err.code !== 'ENOENT') logger.warn(`Could not delete ${p}: ${err.message}`)
  }
}
