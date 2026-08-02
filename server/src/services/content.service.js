import mongoose from 'mongoose'
import slugify from 'slugify'
import { getType } from '../cms/registry.js'
import { validateFields } from '../cms/validator.js'
import { ApiError } from '../utils/ApiError.js'
import { invalidate } from './cache.service.js'

/**
 * All read/write logic for CMS content, shared by the admin routes and the
 * public delivery API. Keeping it here means the public API can never
 * accidentally expose a draft: `publishedOnly` is enforced in one place.
 */

const SINGLE_KEY = '__single'

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function list(typeName, opts = {}) {
  const type = getType(typeName)
  const {
    page = 1,
    limit = 25,
    skip = 0,
    sort,
    search,
    status,
    publishedOnly = false,
    filters = {},
  } = opts

  const query = buildQuery(type, { search, status, publishedOnly, filters })
  const sortSpec = parseSort(sort || type.defaultSort)

  const [items, total] = await Promise.all([
    type.model.find(query).sort(sortSpec).skip(skip).limit(limit).lean(),
    type.model.countDocuments(query),
  ])

  return { items, total, page, limit }
}

export async function getById(typeName, id) {
  const type = getType(typeName)
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound(`${type.singular} not found`)
  const doc = await type.model.findById(id).lean()
  if (!doc) throw ApiError.notFound(`${type.singular} not found`)
  return doc
}

export async function getBySlug(typeName, slug, { publishedOnly = false } = {}) {
  const type = getType(typeName)
  if (!type.slugField) throw ApiError.badRequest(`"${typeName}" has no slug field`)

  const query = { [type.slugField]: String(slug).toLowerCase() }
  if (publishedOnly && type.publishable) query.status = 'published'

  const doc = await type.model.findOne(query).lean()
  if (!doc) throw ApiError.notFound(`${type.singular} not found`)
  return doc
}

/** Single-types always resolve to a document — created empty on first read. */
export async function getSingle(typeName) {
  const type = getType(typeName)
  if (!type.isSingle) throw ApiError.badRequest(`"${typeName}" is a collection, not a single type`)

  let doc = await type.model.findOne({}).lean()
  if (!doc) {
    const { value } = validateFields(type.fields, {}, { partial: false })
    doc = (await type.model.create({ ...value, [SINGLE_KEY]: true })).toObject()
  }
  return doc
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function create(typeName, payload, ctx = {}) {
  const type = getType(typeName)
  if (type.isSingle) throw ApiError.badRequest(`"${typeName}" is a single type — use update instead`)

  const prepared = prefillSlug(type, payload)
  const { value, errors } = validateFields(type.fields, prepared)
  if (Object.keys(errors).length) throw ApiError.validation(errors)

  await applySlug(type, value, null)
  applyHook(type, value)
  applyPublishDate(type, value, null)

  if (type.orderable && !value.order) {
    value.order = await nextOrder(type)
  }

  value.createdBy = ctx.userId
  value.updatedBy = ctx.userId

  const doc = await type.model.create(value)
  invalidate('public:')
  return doc.toObject()
}

export async function update(typeName, id, payload, ctx = {}) {
  const type = getType(typeName)

  const existing = type.isSingle
    ? await type.model.findOne({})
    : await type.model.findById(id)

  if (!existing && !type.isSingle) throw ApiError.notFound(`${type.singular} not found`)

  const prepared = prefillSlug(type, payload, existing)
  const { value, errors } = validateFields(type.fields, prepared, { partial: ctx.partial !== false })
  if (Object.keys(errors).length) throw ApiError.validation(errors)

  if (type.isSingle && !existing) {
    const doc = await type.model.create({ ...value, createdBy: ctx.userId, updatedBy: ctx.userId })
    return doc.toObject()
  }

  await applySlug(type, value, existing._id)
  applyHook(type, value, existing)
  applyPublishDate(type, value, existing)

  Object.assign(existing, value)
  existing.updatedBy = ctx.userId
  await existing.save()

  invalidate('public:')
  return existing.toObject()
}

export async function remove(typeName, id) {
  const type = getType(typeName)
  if (type.isSingle) throw ApiError.badRequest('Single types cannot be deleted')

  const doc = await type.model.findByIdAndDelete(id)
  if (!doc) throw ApiError.notFound(`${type.singular} not found`)

  invalidate('public:')
  return doc.toObject()
}

export async function duplicate(typeName, id, ctx = {}) {
  const type = getType(typeName)
  const source = await getById(typeName, id)

  const copy = { ...source }
  delete copy._id
  delete copy.id
  delete copy.createdAt
  delete copy.updatedAt

  if (type.titleField && copy[type.titleField]) {
    copy[type.titleField] = `${copy[type.titleField]} (copy)`
  }
  if (type.slugField && copy[type.slugField]) {
    copy[type.slugField] = `${copy[type.slugField]}-copy`
  }
  if (type.publishable) {
    copy.status = 'draft'
    copy.publishedAt = undefined
  }
  copy.createdBy = ctx.userId
  copy.updatedBy = ctx.userId

  await applySlug(type, copy, null)
  const doc = await type.model.create(copy)
  invalidate('public:')
  return doc.toObject()
}

export async function setStatus(typeName, id, status, ctx = {}) {
  const type = getType(typeName)
  if (!type.publishable) throw ApiError.badRequest(`"${typeName}" is not publishable`)

  const doc = await type.model.findById(id)
  if (!doc) throw ApiError.notFound(`${type.singular} not found`)

  doc.status = status
  if (status === 'published' && !doc.publishedAt) doc.publishedAt = new Date()
  doc.updatedBy = ctx.userId
  await doc.save()

  invalidate('public:')
  return doc.toObject()
}

/** Persists a drag-and-drop reorder: `[{ id, order }, …]`. */
export async function reorder(typeName, items, ctx = {}) {
  const type = getType(typeName)
  if (!type.orderable) throw ApiError.badRequest(`"${typeName}" is not orderable`)
  if (!Array.isArray(items) || !items.length) throw ApiError.badRequest('Expected a non-empty array of { id, order }')

  const ops = items
    .filter(i => mongoose.isValidObjectId(i.id))
    .map((i, index) => ({
      updateOne: {
        filter: { _id: i.id },
        update: { $set: { order: Number.isFinite(i.order) ? i.order : index, updatedBy: ctx.userId } },
      },
    }))

  if (!ops.length) throw ApiError.badRequest('No valid records to reorder')
  await type.model.bulkWrite(ops)
  invalidate('public:')
  return { updated: ops.length }
}

export async function bulkRemove(typeName, ids) {
  const type = getType(typeName)
  if (type.isSingle) throw ApiError.badRequest('Single types cannot be deleted')

  const valid = (ids || []).filter(id => mongoose.isValidObjectId(id))
  if (!valid.length) throw ApiError.badRequest('No valid ids supplied')

  const res = await type.model.deleteMany({ _id: { $in: valid } })
  invalidate('public:')
  return { deleted: res.deletedCount }
}

export async function counts() {
  const { allTypes } = await import('../cms/registry.js')
  const entries = await Promise.all(
    allTypes().map(async type => {
      const total = await type.model.countDocuments()
      const published = type.publishable
        ? await type.model.countDocuments({ status: 'published' })
        : total
      return [type.name, { total, published, drafts: total - published, label: type.label }]
    }),
  )
  return Object.fromEntries(entries)
}

// ─── Internals ───────────────────────────────────────────────────────────────

function buildQuery(type, { search, status, publishedOnly, filters }) {
  const query = {}

  if (publishedOnly && type.publishable) {
    query.status = 'published'
  } else if (status && status !== 'all') {
    query.status = status
  }

  if (search && type.searchFields?.length) {
    const rx = new RegExp(escapeRegex(search), 'i')
    query.$or = type.searchFields.map(f => ({ [f]: rx }))
  }

  for (const [key, raw] of Object.entries(filters || {})) {
    const field = type.fields.find(f => f.name === key)
    if (!field) continue
    if (field.type === 'boolean') query[key] = raw === true || raw === 'true'
    else if (field.type === 'number') query[key] = Number(raw)
    else if (field.type === 'reference') { if (mongoose.isValidObjectId(raw)) query[key] = raw }
    else query[key] = raw
  }

  return query
}

function parseSort(sort) {
  const spec = {}
  for (const part of String(sort).split(',').map(s => s.trim()).filter(Boolean)) {
    if (part.startsWith('-')) spec[part.slice(1)] = -1
    else spec[part] = 1
  }
  // A stable tiebreaker keeps pagination deterministic.
  if (!spec.createdAt) spec.createdAt = -1
  return spec
}

/**
 * Derives the slug from the title *before* validation runs.
 *
 * Slug fields are declared `required` so the admin UI marks them, but editors
 * are not expected to type one — without this pre-fill the validator would
 * reject a perfectly good record for a field the system generates itself.
 */
function prefillSlug(type, payload, existing) {
  const field = type.slugField
  if (!field) return payload

  const supplied = payload?.[field]
  if (supplied) return payload
  // A partial update that doesn't mention the slug must not disturb the saved one.
  if (existing?.[field] && !Object.prototype.hasOwnProperty.call(payload || {}, field)) return payload

  const source = payload?.[type.titleField] || existing?.[type.titleField]
  if (!source) return payload

  return { ...payload, [field]: slugify(String(source), { lower: true, strict: true }) }
}

/**
 * Guarantees slug uniqueness by appending -2, -3 … rather than rejecting the
 * save with a duplicate-key error.
 */
async function applySlug(type, value, excludeId) {
  const field = type.slugField
  if (!field) return

  let base = value[field]
  if (!base && value[type.titleField]) {
    base = slugify(String(value[type.titleField]), { lower: true, strict: true })
  }
  if (!base) return

  base = slugify(String(base), { lower: true, strict: true })

  let candidate = base
  let n = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await type.model.exists({
      [field]: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
    if (!clash) break
    candidate = `${base}-${++n}`
  }

  value[field] = candidate
}

function applyHook(type, value, existing) {
  if (typeof type.hooks?.beforeSave === 'function') {
    type.hooks.beforeSave(value, existing)
  }
}

function applyPublishDate(type, value, existing) {
  if (!type.publishable) return
  if (value.status === 'published' && !value.publishedAt && !existing?.publishedAt) {
    value.publishedAt = new Date()
  }
}

async function nextOrder(type) {
  const last = await type.model.findOne({}).sort({ order: -1 }).select('order').lean()
  return (last?.order ?? -1) + 1
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
