import { getFieldType, isBlank } from './fieldTypes.js'

/**
 * Validates and normalises a payload against a content type's field list.
 *
 * Returns `{ value, errors }`. `errors` is a flat map keyed by dotted path
 * (`faqs.0.question`) so the admin UI can highlight the exact input that failed.
 *
 * @param {Array}  fields   Field descriptors
 * @param {object} payload  Raw JSON body
 * @param {object} [opts]
 * @param {boolean} [opts.partial]  Skip `required` checks for absent keys (PATCH)
 */
export function validateFields(fields, payload = {}, opts = {}) {
  const errors = {}
  const value = walkGroup(fields, payload, '', errors, opts)
  return { value, errors, valid: Object.keys(errors).length === 0 }
}

function walkGroup(fields, source, prefix, errors, opts) {
  const out = {}
  const input = source && typeof source === 'object' ? source : {}

  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name
    const present = Object.prototype.hasOwnProperty.call(input, field.name)

    // PATCH semantics: an absent key means "leave untouched".
    if (opts.partial && !present) continue

    let raw = present ? input[field.name] : cloneDefault(field)
    const result = walkField(field, raw, path, errors, opts)
    if (result !== undefined) out[field.name] = result
  }

  return out
}

function walkField(field, raw, path, errors, opts) {
  const type = getFieldType(field.type)

  if (field.type === 'object') {
    const nested = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
    return walkGroup(field.fields || [], nested, path, errors, opts)
  }

  if (field.type === 'array') {
    const items = type.coerce(raw)
    const itemDef = field.of || { type: 'string' }
    const err = type.check(items, field)
    if (err) errors[path] = `${label(field)} ${err}`

    return items.map((item, i) => {
      const itemPath = `${path}.${i}`
      if (itemDef.type === 'object') {
        return walkGroup(itemDef.fields || [], item, itemPath, errors, opts)
      }
      return walkField({ ...itemDef, name: String(i), label: `Item ${i + 1}` }, item, itemPath, errors, opts)
    })
  }

  const coerced = type.coerce(raw, field)
  const empty = type.isEmpty ? type.isEmpty(coerced) : isBlank(coerced)

  if (field.required && empty) {
    errors[path] = `${label(field)} is required`
    return coerced
  }

  if (!empty) {
    const err = type.check(coerced, field)
    if (err) errors[path] = `${label(field)} ${err}`
  }

  return coerced
}

function cloneDefault(field) {
  if (typeof field.default === 'function') return field.default()
  if (Array.isArray(field.default)) return [...field.default]
  if (field.default && typeof field.default === 'object') return { ...field.default }
  return field.default
}

function label(field) {
  return field.label || humanise(field.name)
}

export function humanise(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, c => c.toUpperCase())
}
