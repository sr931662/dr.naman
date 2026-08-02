import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

const { Schema } = mongoose

/**
 * The field-type registry.
 *
 * Every content type in this CMS is described declaratively as a list of fields.
 * Each entry here teaches the system three things about a field type:
 *
 *   mongoose(field) → the Mongoose path definition (how it is stored)
 *   coerce(value)   → normalise raw JSON from the admin UI / API into storage form
 *   check(value)    → return an error string, or null when valid
 *   input           → the widget the auto-generated admin form should render
 *
 * Adding a new field type is a single entry here — models, validation, REST
 * routes and the admin form all pick it up automatically.
 */

const RICHTEXT_ALLOWED = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'ul', 'ol', 'li',
    'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'figure', 'figcaption', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'sup', 'sub', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    span: ['class'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.href?.startsWith('http')
        ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
        : attribs,
    }),
  },
}

/**
 * SVG icons are first-class content on this site (condition icons, treatment
 * icons), so they get their own type with an SVG-aware allow-list rather than
 * being pushed through the prose sanitiser.
 */
const SVG_ALLOWED = {
  allowedTags: [
    'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
    'defs', 'pattern', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask',
    'use', 'text', 'tspan', 'title', 'desc',
  ],
  allowedAttributes: { '*': ['*'] },
  // sanitize-html lower-cases tag names by default, which breaks camelCase SVG tags.
  parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
  disallowedTagsMode: 'discard',
}

const str = v => (v === null || v === undefined ? '' : String(v))
const isBlank = v => v === undefined || v === null || v === '' ||
  (Array.isArray(v) && v.length === 0)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const URL_RE = /^(https?:\/\/|\/|mailto:|tel:|#)/i
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const fieldTypes = {
  string: {
    input: 'text',
    mongoose: () => ({ type: String, trim: true }),
    coerce: v => str(v).trim(),
    check: (v, f) => lengthCheck(v, f),
  },

  text: {
    input: 'textarea',
    mongoose: () => ({ type: String, trim: true }),
    coerce: v => str(v).trim(),
    check: (v, f) => lengthCheck(v, f),
  },

  richtext: {
    input: 'richtext',
    mongoose: () => ({ type: String }),
    coerce: v => sanitizeHtml(str(v), RICHTEXT_ALLOWED),
    check: () => null,
  },

  svg: {
    input: 'svg',
    mongoose: () => ({ type: String }),
    coerce: v => (str(v).trim() ? sanitizeHtml(str(v).trim(), SVG_ALLOWED) : ''),
    check: v => (v && !/^<svg[\s>]/i.test(v.trim()) ? 'must be an <svg> element' : null),
  },

  slug: {
    input: 'slug',
    // No `index: true` here — buildModel declares the unique index explicitly,
    // and declaring it twice makes Mongoose warn about a duplicate.
    mongoose: () => ({ type: String, trim: true, lowercase: true }),
    coerce: v => str(v).trim().toLowerCase(),
    check: v => (v && !SLUG_RE.test(v) ? 'must be lowercase words separated by hyphens' : null),
  },

  number: {
    input: 'number',
    mongoose: () => ({ type: Number }),
    coerce: v => (isBlank(v) ? undefined : Number(v)),
    check: (v, f) => {
      if (v === undefined) return null
      if (Number.isNaN(v)) return 'must be a number'
      if (f.min !== undefined && v < f.min) return `must be at least ${f.min}`
      if (f.max !== undefined && v > f.max) return `must be at most ${f.max}`
      if (f.integer && !Number.isInteger(v)) return 'must be a whole number'
      return null
    },
  },

  boolean: {
    input: 'checkbox',
    mongoose: () => ({ type: Boolean, default: false }),
    coerce: v => v === true || v === 'true' || v === 1 || v === '1' || v === 'on',
    check: () => null,
  },

  date: {
    input: 'date',
    mongoose: () => ({ type: Date }),
    coerce: v => (isBlank(v) ? undefined : new Date(v)),
    check: v => (v !== undefined && Number.isNaN(v?.getTime?.()) ? 'must be a valid date' : null),
  },

  select: {
    input: 'select',
    mongoose: f => ({ type: String, enum: f.options?.map(optValue).concat(['']) }),
    coerce: v => str(v).trim(),
    check: (v, f) => {
      if (!v) return null
      const allowed = (f.options || []).map(optValue)
      return allowed.includes(v) ? null : `must be one of: ${allowed.join(', ')}`
    },
  },

  multiselect: {
    input: 'multiselect',
    mongoose: () => ({ type: [String], default: [] }),
    coerce: v => (Array.isArray(v) ? v.map(str) : isBlank(v) ? [] : [str(v)]),
    check: (v, f) => {
      const allowed = (f.options || []).map(optValue)
      const bad = (v || []).filter(x => !allowed.includes(x))
      return bad.length ? `invalid: ${bad.join(', ')}` : null
    },
  },

  color: {
    input: 'color',
    mongoose: () => ({ type: String, trim: true }),
    coerce: v => str(v).trim(),
    check: v => (v && !HEX_RE.test(v) ? 'must be a hex colour like #b3122a' : null),
  },

  url: {
    input: 'url',
    mongoose: () => ({ type: String, trim: true }),
    coerce: v => str(v).trim(),
    check: v => (v && !URL_RE.test(v) ? 'must be a URL, or start with / # mailto: tel:' : null),
  },

  email: {
    input: 'email',
    mongoose: () => ({ type: String, trim: true, lowercase: true }),
    coerce: v => str(v).trim().toLowerCase(),
    check: v => (v && !EMAIL_RE.test(v) ? 'must be a valid email address' : null),
  },

  phone: {
    input: 'tel',
    mongoose: () => ({ type: String, trim: true }),
    coerce: v => str(v).trim(),
    check: v => (v && !/^[+0-9()\-.\s]{6,24}$/.test(v) ? 'must be a valid phone number' : null),
  },

  /** A media-library reference, denormalised so the site never needs a join. */
  image: {
    input: 'image',
    mongoose: () => ({
      type: {
        _id: false,
        url: { type: String, trim: true, default: '' },
        alt: { type: String, trim: true, default: '' },
        width: Number,
        height: Number,
        media: { type: Schema.Types.ObjectId, ref: 'Media' },
      },
      default: () => ({ url: '', alt: '' }),
    }),
    coerce: v => {
      if (!v) return { url: '', alt: '' }
      if (typeof v === 'string') return { url: v.trim(), alt: '' }
      return {
        url: str(v.url).trim(),
        alt: str(v.alt).trim(),
        width: v.width ? Number(v.width) : undefined,
        height: v.height ? Number(v.height) : undefined,
        media: v.media || undefined,
      }
    },
    check: v => (v?.url && !URL_RE.test(v.url) ? 'image URL is not valid' : null),
    isEmpty: v => !v?.url,
  },

  /** Free-form JSON escape hatch for genuinely unstructured settings. */
  json: {
    input: 'json',
    mongoose: () => ({ type: Schema.Types.Mixed }),
    coerce: v => {
      if (typeof v !== 'string') return v
      if (!v.trim()) return undefined
      try { return JSON.parse(v) } catch { return { __invalid: v } }
    },
    check: v => (v && v.__invalid !== undefined ? 'must be valid JSON' : null),
  },

  /** Repeatable field — `of` describes each item (any other field type). */
  array: {
    input: 'array',
    mongoose: () => ({ type: [Schema.Types.Mixed], default: [] }),
    coerce: v => (Array.isArray(v) ? v : isBlank(v) ? [] : [v]),
    check: (v, f) => {
      if (f.minItems && v.length < f.minItems) return `needs at least ${f.minItems} item(s)`
      if (f.maxItems && v.length > f.maxItems) return `allows at most ${f.maxItems} item(s)`
      return null
    },
  },

  /** Grouped sub-fields stored as a nested object. */
  object: {
    input: 'object',
    mongoose: () => ({ type: Schema.Types.Mixed, default: () => ({}) }),
    coerce: v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {}),
    check: () => null,
  },

  /** Relation to another content type, stored as an ObjectId. */
  reference: {
    input: 'reference',
    mongoose: f => ({ type: Schema.Types.ObjectId, ref: f.refModel || undefined, index: true }),
    coerce: v => {
      if (isBlank(v)) return undefined
      const id = typeof v === 'object' ? v._id || v.id : v
      return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(String(id)) : { __invalid: id }
    },
    check: v => (v?.__invalid !== undefined ? 'is not a valid reference' : null),
  },
}

function optValue(o) {
  return typeof o === 'string' ? o : o.value
}

function lengthCheck(v, f) {
  if (f.minLength && v.length < f.minLength) return `must be at least ${f.minLength} characters`
  if (f.maxLength && v.length > f.maxLength) return `must be at most ${f.maxLength} characters`
  if (f.pattern && v && !new RegExp(f.pattern).test(v)) return f.patternMessage || 'has an invalid format'
  return null
}

export function getFieldType(name) {
  const t = fieldTypes[name]
  if (!t) throw new Error(`Unknown CMS field type: "${name}"`)
  return t
}

export { isBlank, SLUG_RE }
