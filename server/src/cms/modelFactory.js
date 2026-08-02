import mongoose from 'mongoose'
import { getFieldType } from './fieldTypes.js'

const { Schema } = mongoose

/**
 * Builds a Mongoose model from a normalised content-type definition.
 *
 * Scalar fields get real, typed paths so Mongo can index and sort on them.
 * Repeatable/nested fields are stored as Mixed — the application-level
 * validator in validator.js is the source of truth for their shape, which keeps
 * editors free to reshape nested content without a migration.
 */
export function buildModel(type) {
  const modelName = pascal(type.name)
  if (mongoose.models[modelName]) return mongoose.models[modelName]

  const paths = {}
  for (const field of type.fields) {
    paths[field.name] = buildPath(field)
  }

  // Editorial provenance — every record knows who touched it last.
  paths.createdBy = { type: Schema.Types.ObjectId, ref: 'User' }
  paths.updatedBy = { type: Schema.Types.ObjectId, ref: 'User' }

  const schema = new Schema(paths, {
    timestamps: true,
    collection: type.name,
    minimize: false,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  })

  // Only declare the slug index here when the field itself hasn't asked for
  // `unique` — Mongoose builds an index for that already, and declaring both
  // trips its duplicate-index warning.
  const slugDeclaresUnique = type.fields.find(f => f.name === type.slugField)?.unique
  if (type.slugField && !slugDeclaresUnique) {
    schema.index({ [type.slugField]: 1 }, { unique: true, sparse: true })
  }
  if (type.publishable) {
    schema.index({ status: 1, publishedAt: -1 })
  }
  if (type.orderable) {
    schema.index({ order: 1 })
  }
  if (type.searchFields?.length) {
    schema.index(
      Object.fromEntries(type.searchFields.map(f => [f, 'text'])),
      { name: `${type.name}_text`, default_language: 'english' },
    )
  }
  for (const idx of type.indexes) {
    schema.index(idx.fields, idx.options || {})
  }

  // Keep publishedAt honest without making editors think about it.
  schema.pre('save', function setPublishedAt(next) {
    if (type.publishable) {
      if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
      if (this.status !== 'published' && this.isModified('status') && !this.$locals.keepPublishedAt) {
        // Retain the original date so re-publishing does not lose history.
      }
    }
    next()
  })

  return mongoose.model(modelName, schema)
}

function buildPath(field) {
  const type = getFieldType(field.type)

  if (field.type === 'array' || field.type === 'object') {
    return type.mongoose(field)
  }

  const path = { ...type.mongoose(field) }

  if (field.default !== undefined && typeof field.default !== 'function') {
    path.default = field.default
  }
  if (field.unique) {
    path.unique = true
    path.sparse = true
  }
  if (field.index) path.index = true

  return path
}

export function pascal(name) {
  return String(name)
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^./, c => c.toUpperCase())
}
