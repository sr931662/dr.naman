import { el, clear, getPath, setPath, modal, toast } from './ui.js'
import { api } from './api.js'
import { pickMedia } from './views/media.js'

/**
 * The schema-driven form renderer.
 *
 * Given a content type's field descriptors and a working model object, it
 * renders the whole editor. Inputs mutate the model in place through
 * `setPath`, so saving is just `PUT` of the model — there is no separate
 * DOM-scraping step that could drift from what the user sees.
 */

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * @param {Array}  fields  Field descriptors from /api/cms/schema
 * @param {object} model   The working document (mutated in place)
 * @param {object} errors  Server validation errors keyed by dotted path
 * @returns {{node: HTMLElement, groups: string[]}}
 */
export function renderForm(fields, model, errors = {}) {
  const groups = groupFields(fields)
  const node = el('div', { class: 'form-body' })

  for (const [groupName, groupFields] of groups) {
    const section = el('div', { class: 'form-section', dataset: { group: groupName } })
    if (groups.size > 1) {
      section.append(el('div', { class: 'group-title', style: { marginBottom: '12px' } }, groupName))
    }
    for (const field of groupFields) {
      section.append(renderField(field, model, field.name, errors))
    }
    node.append(section)
  }

  return { node, groups: [...groups.keys()] }
}

function groupFields(fields) {
  const groups = new Map()
  for (const field of fields) {
    const key = field.group || 'Content'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(field)
  }
  // "Meta" and "SEO" belong at the end of the form regardless of declaration order.
  const tail = ['SEO', 'Meta']
  return new Map([...groups.entries()].sort((a, b) => {
    const ai = tail.indexOf(a[0]) === -1 ? -1 : tail.indexOf(a[0])
    const bi = tail.indexOf(b[0]) === -1 ? -1 : tail.indexOf(b[0])
    return ai - bi
  }))
}

// ─── Field dispatch ──────────────────────────────────────────────────────────

export function renderField(field, model, path, errors = {}) {
  const error = errors[path]

  if (field.type === 'object') return renderObject(field, model, path, errors)
  if (field.type === 'array') return renderArray(field, model, path, errors)

  const wrap = el('div', { class: `field${error ? ' has-error' : ''}` })

  if (field.type !== 'boolean') {
    wrap.append(el('label', { for: `f-${path}` },
      field.label,
      field.required && el('span', { class: 'req' }, ' *'),
    ))
  }

  wrap.append(widget(field, model, path))

  if (field.help) wrap.append(el('div', { class: 'help' }, field.help))
  if (error) wrap.append(el('div', { class: 'err' }, error))

  return wrap
}

function widget(field, model, path) {
  const value = getPath(model, path)
  const commit = v => setPath(model, path, v)

  switch (field.type) {
    case 'text':
      return el('textarea', {
        id: `f-${path}`,
        rows: field.rows || 3,
        value: value ?? '',
        placeholder: field.placeholder || '',
        oninput: e => commit(e.target.value),
      })

    case 'richtext':
      return richTextEditor(value ?? '', commit)

    case 'svg':
      return svgEditor(value ?? '', commit)

    case 'boolean':
      return el('div', { class: 'check' },
        el('input', {
          type: 'checkbox',
          id: `f-${path}`,
          checked: Boolean(value),
          onchange: e => commit(e.target.checked),
        }),
        el('label', { for: `f-${path}` }, field.label),
      )

    case 'number':
      return el('input', {
        type: 'number',
        id: `f-${path}`,
        value: value ?? '',
        min: field.min,
        max: field.max,
        step: field.integer ? 1 : 'any',
        oninput: e => commit(e.target.value === '' ? undefined : Number(e.target.value)),
      })

    case 'date':
      return el('input', {
        type: 'date',
        id: `f-${path}`,
        value: value ? String(value).slice(0, 10) : '',
        oninput: e => commit(e.target.value || undefined),
      })

    case 'select':
      return el('select', {
        id: `f-${path}`,
        onchange: e => commit(e.target.value),
      },
        !field.required && el('option', { value: '' }, '— none —'),
        (field.options || []).map(opt => {
          const v = typeof opt === 'string' ? opt : opt.value
          const l = typeof opt === 'string' ? opt : opt.label || opt.value
          return el('option', { value: v, selected: value === v }, l)
        }),
      )

    case 'multiselect':
      return multiSelect(field, value || [], commit)

    case 'color':
      return el('div', { style: { display: 'flex', gap: '8px' } },
        el('input', {
          type: 'color',
          value: value || '#b3122a',
          oninput: e => { commit(e.target.value); e.target.nextSibling.value = e.target.value },
        }),
        el('input', {
          type: 'text',
          id: `f-${path}`,
          value: value ?? '',
          placeholder: '#b3122a',
          oninput: e => commit(e.target.value),
        }),
      )

    case 'image':
      return imageField(value, commit)

    case 'json':
      return el('textarea', {
        id: `f-${path}`,
        class: 'code',
        rows: 6,
        value: value ? JSON.stringify(value, null, 2) : '',
        oninput: e => commit(e.target.value),
      })

    case 'reference':
      return referenceField(field, value, commit)

    case 'slug':
      return el('input', {
        type: 'text',
        id: `f-${path}`,
        class: 'mono',
        value: value ?? '',
        placeholder: 'auto-generated-from-title',
        oninput: e => commit(e.target.value),
      })

    default:
      return el('input', {
        type: { email: 'email', url: 'url', phone: 'tel' }[field.type] || 'text',
        id: `f-${path}`,
        value: value ?? '',
        placeholder: field.placeholder || '',
        maxlength: field.maxLength,
        oninput: e => commit(e.target.value),
      })
  }
}

// ─── Composite widgets ───────────────────────────────────────────────────────

function renderObject(field, model, path, errors) {
  if (getPath(model, path) == null) setPath(model, path, {})

  const group = el('div', { class: 'field-group' },
    el('div', { class: 'group-title' }, field.label),
    field.help && el('div', { class: 'help', style: { marginTop: '-8px', marginBottom: '12px' } }, field.help),
  )

  for (const sub of field.fields || []) {
    group.append(renderField(sub, model, `${path}.${sub.name}`, errors))
  }
  return group
}

function renderArray(field, model, path, errors) {
  if (!Array.isArray(getPath(model, path))) setPath(model, path, [])

  const itemDef = field.of || { type: 'string', label: 'Value' }
  const container = el('div', { class: 'field-group' })

  const head = el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' } },
    el('div', { class: 'group-title', style: { margin: 0 } }, field.label),
    el('div', { style: { flex: '1' } }),
    el('button', {
      type: 'button',
      class: 'btn btn-sm',
      onclick: () => {
        getPath(model, path).push(blankItem(itemDef))
        redraw()
      },
    }, '+ Add'),
  )
  container.append(head)
  if (field.help) container.append(el('div', { class: 'help', style: { marginBottom: '10px' } }, field.help))

  const list = el('div', { class: 'array-items' })
  container.append(list)

  function redraw() {
    clear(list)
    const items = getPath(model, path) || []

    if (!items.length) {
      list.append(el('div', { class: 'hint', style: { padding: '10px 0' } }, 'No items yet.'))
      return
    }

    items.forEach((_, index) => {
      const itemPath = `${path}.${index}`

      const controls = [
        el('button', {
          type: 'button', class: 'btn btn-sm btn-icon', title: 'Move up', disabled: index === 0,
          onclick: () => { swap(getPath(model, path), index, index - 1); redraw() },
        }, '↑'),
        el('button', {
          type: 'button', class: 'btn btn-sm btn-icon', title: 'Move down', disabled: index === items.length - 1,
          onclick: () => { swap(getPath(model, path), index, index + 1); redraw() },
        }, '↓'),
        el('button', {
          type: 'button', class: 'btn btn-sm btn-icon btn-danger', title: 'Remove',
          onclick: () => { getPath(model, path).splice(index, 1); redraw() },
        }, '✕'),
      ]

      if (itemDef.type === 'object') {
        const box = el('div', { class: 'array-item' },
          el('div', { class: 'array-item-head' },
            el('span', { class: 'idx' }, `#${index + 1}`),
            el('span', { style: { flex: '1' } }),
            ...controls,
          ),
        )
        for (const sub of itemDef.fields || []) {
          box.append(renderField(sub, model, `${itemPath}.${sub.name}`, errors))
        }
        list.append(box)
      } else {
        list.append(el('div', { class: 'array-item' },
          el('div', { class: 'array-simple' },
            el('div', {}, renderField({ ...itemDef, label: '', help: '' }, model, itemPath, errors)),
            ...controls,
          ),
        ))
      }
    })
  }

  redraw()
  return container
}

function blankItem(def) {
  if (def.type === 'object') {
    const out = {}
    for (const f of def.fields || []) {
      out[f.name] = f.default !== undefined ? f.default
        : f.type === 'array' ? []
        : f.type === 'boolean' ? false
        : f.type === 'object' ? {}
        : ''
    }
    return out
  }
  if (def.type === 'array') return []
  if (def.type === 'boolean') return false
  if (def.type === 'number') return 0
  return ''
}

function swap(arr, a, b) {
  ;[arr[a], arr[b]] = [arr[b], arr[a]]
}

function multiSelect(field, value, commit) {
  const selected = new Set(value)
  return el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
    (field.options || []).map(opt => {
      const v = typeof opt === 'string' ? opt : opt.value
      const l = typeof opt === 'string' ? opt : opt.label || opt.value
      const id = `ms-${field.name}-${v}`
      return el('div', { class: 'check' },
        el('input', {
          type: 'checkbox', id, checked: selected.has(v),
          onchange: e => {
            if (e.target.checked) selected.add(v); else selected.delete(v)
            commit([...selected])
          },
        }),
        el('label', { for: id }, l),
      )
    }),
  )
}

function imageField(value, commit) {
  const current = value && typeof value === 'object' ? { ...value } : { url: '', alt: '' }

  const preview = el('div', {
    class: 'img-preview',
    style: current.url ? { backgroundImage: `url("${current.url}")` } : {},
  }, current.url ? '' : 'No image')

  const urlInput = el('input', {
    type: 'text', value: current.url || '', placeholder: 'Image URL, or pick from the library',
    oninput: e => {
      current.url = e.target.value
      preview.style.backgroundImage = current.url ? `url("${current.url}")` : ''
      preview.textContent = current.url ? '' : 'No image'
      commit({ ...current })
    },
  })

  const altInput = el('input', {
    type: 'text', value: current.alt || '', placeholder: 'Alt text (describes the image for screen readers)',
    oninput: e => { current.alt = e.target.value; commit({ ...current }) },
  })

  return el('div', { class: 'img-field' },
    preview,
    el('div', { class: 'img-meta' },
      urlInput,
      altInput,
      el('div', { style: { display: 'flex', gap: '8px' } },
        el('button', {
          type: 'button', class: 'btn btn-sm',
          onclick: async () => {
            const picked = await pickMedia()
            if (!picked) return
            Object.assign(current, {
              url: picked.url,
              alt: picked.alt || current.alt,
              width: picked.width,
              height: picked.height,
              media: picked.id || picked._id,
            })
            urlInput.value = current.url
            altInput.value = current.alt || ''
            preview.style.backgroundImage = `url("${current.url}")`
            preview.textContent = ''
            commit({ ...current })
          },
        }, '🖼 Choose from library'),
        current.url && el('button', {
          type: 'button', class: 'btn btn-sm btn-danger',
          onclick: () => {
            Object.assign(current, { url: '', alt: '', media: undefined })
            urlInput.value = ''
            altInput.value = ''
            preview.style.backgroundImage = ''
            preview.textContent = 'No image'
            commit({ ...current })
          },
        }, 'Clear'),
      ),
    ),
  )
}

function referenceField(field, value, commit) {
  const select = el('select', { onchange: e => commit(e.target.value || undefined) },
    el('option', { value: '' }, '— none —'),
  )

  const typeName = (field.refModel || '').toLowerCase()
  if (typeName) {
    api.get(`/cms/${typeName}`, { limit: 100 })
      .then(res => {
        const titleField = res.meta?.schema?.titleField || 'title'
        for (const item of res.data) {
          select.append(el('option', {
            value: item._id,
            selected: String(value) === String(item._id),
          }, item[titleField] || item._id))
        }
      })
      .catch(() => { select.append(el('option', { disabled: true }, 'Could not load options')) })
  }

  return select
}

/**
 * A deliberately minimal rich-text editor. `execCommand` is legacy, but it is
 * the only zero-dependency way to get formatting in a contenteditable, and the
 * server sanitises whatever HTML arrives anyway.
 */
function richTextEditor(html, commit) {
  const area = el('div', {
    contenteditable: 'true',
    class: 'rt-area',
    style: {
      minHeight: '220px', padding: '12px 14px', border: '1px solid var(--line)',
      borderTop: '0', borderRadius: '0 0 6px 6px', background: '#fff',
      lineHeight: '1.65', overflowY: 'auto', maxHeight: '520px',
    },
    html: html || '',
    oninput: () => commit(area.innerHTML),
  })

  const cmd = (command, arg) => {
    area.focus()
    document.execCommand(command, false, arg)
    commit(area.innerHTML)
  }

  const tool = (label, title, fn) => el('button', {
    type: 'button', class: 'btn btn-sm', title, onclick: fn,
  }, label)

  const toolbar = el('div', {
    style: {
      display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '7px',
      border: '1px solid var(--line)', borderRadius: '6px 6px 0 0',
      background: 'var(--line-soft)',
    },
  },
    tool('B', 'Bold', () => cmd('bold')),
    tool('I', 'Italic', () => cmd('italic')),
    tool('H2', 'Heading', () => cmd('formatBlock', '<h2>')),
    tool('H3', 'Sub-heading', () => cmd('formatBlock', '<h3>')),
    tool('¶', 'Paragraph', () => cmd('formatBlock', '<p>')),
    tool('“ ”', 'Quote', () => cmd('formatBlock', '<blockquote>')),
    tool('• List', 'Bulleted list', () => cmd('insertUnorderedList')),
    tool('1. List', 'Numbered list', () => cmd('insertOrderedList')),
    tool('🔗', 'Link', () => {
      const url = prompt('Link URL:')
      if (url) cmd('createLink', url)
    }),
    tool('✕', 'Clear formatting', () => cmd('removeFormat')),
    tool('</>', 'Edit HTML source', () => {
      const ta = el('textarea', { class: 'code', rows: 18, value: area.innerHTML })
      const dialog = modal({
        title: 'Edit HTML source',
        body: ta,
        footer: el('button', {
          class: 'btn btn-primary',
          onclick: () => {
            area.innerHTML = ta.value
            commit(area.innerHTML)
            // Closing through the handle plays the exit; reaching into the
            // DOM for `.modal-backdrop` would also grab the wrong dialog
            // whenever this one was opened from inside another.
            dialog.close()
            toast('HTML updated')
          },
        }, 'Apply'),
      })
    }),
  )

  return el('div', {}, toolbar, area)
}

function svgEditor(value, commit) {
  const preview = el('div', { class: 'svg-preview', html: value || '' })
  const textarea = el('textarea', {
    class: 'code', rows: 7, value: value || '',
    placeholder: '<svg viewBox="0 0 48 48">…</svg>',
    oninput: e => {
      commit(e.target.value)
      preview.innerHTML = e.target.value
    },
  })
  return el('div', { style: { display: 'flex', gap: '12px', alignItems: 'flex-start' } },
    preview,
    el('div', { style: { flex: '1' } }, textarea),
  )
}
