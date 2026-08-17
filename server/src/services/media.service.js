import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'
import { Storage } from '@google-cloud/storage'
import { env } from '../config/env.js'
import { Media } from '../models/Media.js'
import { logger } from '../config/logger.js'

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'])
const MAX_DIMENSION = 2400
const THUMB_WIDTH = 400

if (env.storage.useCloudinary) {
  cloudinary.config({
    cloud_name: env.storage.cloudinaryCloudName,
    api_key: env.storage.cloudinaryApiKey,
    api_secret: env.storage.cloudinaryApiSecret,
    secure: true,
  })
}

// `new Storage()` with no explicit key reads Application Default Credentials —
// on Cloud Run that's the instance's attached service account automatically,
// no downloaded JSON key needed. Only constructed at all when GCS_BUCKET is set.
const bucket = env.storage.useGcs
  ? new Storage(env.storage.gcsProjectId ? { projectId: env.storage.gcsProjectId } : undefined)
    .bucket(env.storage.gcsBucket)
  : null

export async function ensureUploadDir() {
  if (env.storage.useCloudinary || bucket) return // nothing to pre-create for either cloud backend
  await fs.mkdir(path.join(env.uploads.dir, 'thumbs'), { recursive: true })
}

/**
 * Writes a buffer to whichever backend is active and returns its public URL.
 * `relativePath` doubles as the identifier used to delete the file again later
 * (Media.storagePath / the filename baked into .thumbnailUrl) — for Cloudinary
 * that's its public_id, for GCS/local disk it's a literal path.
 */
async function writeFile(relativePath, buffer, contentType) {
  if (env.storage.useCloudinary) {
    const publicId = relativePath.replace(/\.[^./]+$/, '')
    // Cloudinary buckets assets by resource_type, and delete calls later need to
    // name the same one — images (including our own generated webp/thumbnails)
    // vs. everything else (PDFs) uploaded as 'raw'.
    const resourceType = contentType?.startsWith('image/') ? 'image' : 'raw'
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: resourceType, overwrite: true },
        (err, res) => (err ? reject(err) : resolve(res)),
      )
      stream.end(buffer)
    })
    return result.secure_url
  }

  if (bucket) {
    await bucket.file(relativePath).save(buffer, { contentType, resumable: false })
    return `https://storage.googleapis.com/${env.storage.gcsBucket}/${relativePath}`
  }

  await fs.mkdir(path.dirname(path.join(env.uploads.dir, relativePath)), { recursive: true })
  await fs.writeFile(path.join(env.uploads.dir, relativePath), buffer)
  return publicUrl(relativePath)
}

async function deleteFile(relativePath, { isImage = true } = {}) {
  if (env.storage.useCloudinary) {
    const publicId = relativePath.replace(/\.[^./]+$/, '')
    await cloudinary.uploader.destroy(publicId, { resource_type: isImage ? 'image' : 'raw' })
      .catch(err => logger.warn(`Could not delete Cloudinary asset ${publicId}: ${err.message}`))
    return
  }
  if (bucket) {
    await bucket.file(relativePath).delete({ ignoreNotFound: true }).catch(err => logger.warn(`Could not delete gs://${env.storage.gcsBucket}/${relativePath}: ${err.message}`))
    return
  }
  await unlinkQuiet(path.join(env.uploads.dir, relativePath))
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
    const thumbBuffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer()
    thumbnailUrl = await writeFile(`thumbs/${thumbName}`, thumbBuffer, 'image/webp')
  }

  const filename = `${safeBase}-${id}${ext}`
  const url = await writeFile(filename, buffer, isVector ? file.mimetype : isImage ? 'image/webp' : file.mimetype)

  const doc = await Media.create({
    filename,
    originalName: file.originalname,
    mimeType: isVector ? file.mimetype : isImage ? 'image/webp' : file.mimetype,
    size: buffer.length,
    width,
    height,
    url,
    thumbnailUrl: thumbnailUrl || (isVector ? url : undefined),
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

  await deleteFile(doc.storagePath, { isImage: doc.mimeType?.startsWith('image/') })
  if (doc.thumbnailUrl) {
    // Thumbnails only ever exist for raster images, always uploaded as 'image/webp'.
    await deleteFile(`thumbs/${path.basename(doc.thumbnailUrl)}`, { isImage: true })
  }

  await doc.deleteOne()
  return doc.toJSON()
}

export function publicUrl(relativePath) {
  if (bucket) return `https://storage.googleapis.com/${env.storage.gcsBucket}/${relativePath}`
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
