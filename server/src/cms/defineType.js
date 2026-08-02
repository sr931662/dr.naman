import { humanise } from './validator.js'

export const STATUSES = ['draft', 'published', 'archived']

/**
 * Normalises a content-type declaration, filling in sensible defaults and
 * appending the system fields implied by its flags.
 *
 * @param {object} def
 * @param {string} def.name          API key + collection name, e.g. 'treatments'
 * @param {'collection'|'single'} [def.kind]
 * @param {string} [def.label]       Plural label for the admin nav
 * @param {string} [def.singular]    Singular label for buttons/headings
 * @param {string} [def.group]       Admin sidebar section
 * @param {string} [def.icon]        Emoji shown in the admin nav
 * @param {string} [def.description] Helper text at the top of the editor
 * @param {boolean}[def.publishable] Adds `status` + `publishedAt`
 * @param {boolean}[def.orderable]   Adds `order` and enables the reorder endpoint
 * @param {string} [def.titleField]  Which field labels a record in lists
 * @param {string} [def.slugField]   Field used for `/by-slug/:slug` lookups
 * @param {string[]} [def.searchFields]
 * @param {string[]} [def.listColumns]
 * @param {Array}  def.fields
 */
export function defineType(def) {
  if (!def?.name) throw new Error('Content type requires a `name`')

  const kind = def.kind || 'collection'
  const isSingle = kind === 'single'
  const publishable = def.publishable ?? !isSingle
  const orderable = (def.orderable ?? !isSingle) && !isSingle

  const fields = [...(def.fields || []).map(normaliseField)]

  if (orderable && !fields.some(f => f.name === 'order')) {
    fields.push(normaliseField({
      name: 'order',
      type: 'number',
      label: 'Sort order',
      integer: true,
      default: 0,
      group: 'Meta',
      help: 'Lower numbers appear first on the site.',
    }))
  }

  if (publishable && !fields.some(f => f.name === 'status')) {
    fields.push(normaliseField({
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft — hidden from the site' },
        { value: 'published', label: 'Published — live' },
        { value: 'archived', label: 'Archived — hidden, kept for reference' },
      ],
      default: 'draft',
      group: 'Meta',
    }))
    fields.push(normaliseField({
      name: 'publishedAt',
      type: 'date',
      label: 'Publish date',
      group: 'Meta',
      help: 'Set automatically when you first publish; override to backdate.',
    }))
  }

  const titleField = def.titleField
    || fields.find(f => ['title', 'name', 'label', 'question'].includes(f.name))?.name
    || fields.find(f => f.type === 'string')?.name
    || '_id'

  const slugField = def.slugField ?? (fields.some(f => f.name === 'slug') ? 'slug' : null)

  return {
    name: def.name,
    kind,
    isSingle,
    label: def.label || humanise(def.name),
    singular: def.singular || humanise(def.name).replace(/ies$/, 'y').replace(/s$/, ''),
    group: def.group || 'Content',
    icon: def.icon || '📄',
    description: def.description || '',
    publishable,
    orderable,
    titleField,
    slugField,
    searchFields: def.searchFields || fields
      .filter(f => ['string', 'text'].includes(f.type))
      .slice(0, 4)
      .map(f => f.name),
    listColumns: def.listColumns
      || fields.filter(f => f.listColumn).map(f => f.name)
      || [titleField],
    defaultSort: def.defaultSort || (orderable ? 'order' : publishable ? '-publishedAt' : '-createdAt'),
    indexes: def.indexes || [],
    hooks: def.hooks || {},
    fields,
  }
}

function normaliseField(f) {
  if (!f?.name) throw new Error(`Field is missing a \`name\`: ${JSON.stringify(f)}`)
  if (!f?.type) throw new Error(`Field "${f.name}" is missing a \`type\``)

  const out = {
    ...f,
    label: f.label || humanise(f.name),
    group: f.group || 'Content',
    required: Boolean(f.required),
  }

  if (f.type === 'object') out.fields = (f.fields || []).map(normaliseField)
  if (f.type === 'array') {
    out.of = f.of ? normaliseArrayItem(f.of) : { type: 'string', label: 'Value' }
  }
  return out
}

function normaliseArrayItem(of) {
  const item = { ...of, label: of.label || 'Value' }
  if (of.type === 'object') item.fields = (of.fields || []).map(normaliseField)
  if (of.type === 'array') item.of = normaliseArrayItem(of.of || { type: 'string' })
  return item
}

/** Field descriptors, minus anything the browser has no business knowing. */
export function publicSchema(type) {
  return {
    name: type.name,
    kind: type.kind,
    label: type.label,
    singular: type.singular,
    group: type.group,
    icon: type.icon,
    description: type.description,
    publishable: type.publishable,
    orderable: type.orderable,
    titleField: type.titleField,
    slugField: type.slugField,
    listColumns: type.listColumns,
    defaultSort: type.defaultSort,
    searchFields: type.searchFields,
    fields: type.fields,
  }
}
