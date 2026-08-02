import { api } from '../api.js'
import { el, clear, toast, confirmDialog, formatDate, statusPill } from '../ui.js'
import { page, pageHeader, typeByName, navigate, can, refreshCounts } from '../app.js'
import { renderForm } from '../fields.js'

/**
 * The record editor. Handles all three shapes: a new record, an existing
 * record, and a single-type ("single") document that has no id.
 */
export async function renderEditor(typeName, id) {
  const type = typeByName(typeName)
  if (!type) throw new Error(`Unknown content type "${typeName}"`)

  const isSingle = type.kind === 'single'
  const isNew = !isSingle && !id

  let doc = {}
  if (isSingle) {
    doc = (await api.get(`/cms/${typeName}`)).data
  } else if (!isNew) {
    doc = (await api.get(`/cms/${typeName}/${id}`)).data
  } else {
    doc = defaultsFor(type)
  }

  // The working model. Field widgets mutate this in place.
  const model = structuredClone(strip(doc))
  let errors = {}
  let dirty = false

  const formHost = el('div')
  const tabsHost = el('div', { class: 'tabs' })
  let activeGroup = null

  function drawForm() {
    clear(formHost)
    clear(tabsHost)

    const { node, groups } = renderForm(type.fields, model, errors)
    if (!activeGroup || !groups.includes(activeGroup)) activeGroup = groups[0]

    if (groups.length > 1) {
      for (const group of groups) {
        const errorCount = Object.keys(errors).filter(path => {
          const field = type.fields.find(f => f.name === path.split('.')[0])
          return (field?.group || 'Content') === group
        }).length

        tabsHost.append(el('button', {
          class: `tab${group === activeGroup ? ' active' : ''}`,
          onclick: () => { activeGroup = group; drawForm() },
        }, group, errorCount ? el('span', { style: { color: 'var(--crimson)' } }, ` (${errorCount})`) : ''))
      }
    }

    for (const section of node.querySelectorAll('.form-section')) {
      section.style.display = groups.length > 1 && section.dataset.group !== activeGroup ? 'none' : ''
      // The group heading is redundant once tabs are showing it.
      if (groups.length > 1) section.querySelector(':scope > .group-title')?.remove()
    }

    formHost.append(node)

    // Track edits so we can warn before navigating away.
    formHost.addEventListener('input', () => { dirty = true }, { once: true })
    formHost.addEventListener('change', () => { dirty = true }, { once: true })
  }

  async function save({ publish } = {}) {
    errors = {}
    if (publish !== undefined && type.publishable) {
      model.status = publish ? 'published' : 'draft'
    }

    saveBtn.disabled = true
    const originalLabel = saveBtn.textContent
    clear(saveBtn)
    saveBtn.append(el('span', { class: 'spinner' }), ' Saving…')

    try {
      let saved
      if (isSingle) {
        saved = (await api.put(`/cms/${typeName}`, model)).data
      } else if (isNew) {
        saved = (await api.post(`/cms/${typeName}`, model)).data
      } else {
        saved = (await api.put(`/cms/${typeName}/${id}`, model)).data
      }

      dirty = false
      toast('Saved', 'success')
      refreshCounts()

      if (isNew) {
        navigate(`/c/${typeName}/${saved._id}`)
      } else {
        // Pull server-side derivations (slug, readTime, publishedAt) back in.
        Object.assign(model, strip(saved))
        drawForm()
        drawSidebar(saved)
      }
    } catch (err) {
      if (err.status === 422 && err.details) {
        errors = err.details
        drawForm()
        toast(`${Object.keys(errors).length} field(s) need attention`, 'error')
      } else {
        toast(err.message || 'Could not save', 'error')
      }
    } finally {
      saveBtn.disabled = false
      clear(saveBtn)
      saveBtn.append(originalLabel)
    }
  }

  const saveBtn = el('button', { class: 'btn btn-primary', onclick: () => save() }, 'Save')

  const sidebar = el('div', { class: 'editor-side' })

  function drawSidebar(current = doc) {
    clear(sidebar)

    if (type.publishable) {
      sidebar.append(el('div', { class: 'card card-pad' },
        el('div', { class: 'group-title' }, 'Publishing'),
        el('div', { class: 'meta-row' },
          el('span', {}, 'Status'),
          statusPill(model.status || 'draft'),
        ),
        el('div', { class: 'meta-row' },
          el('span', {}, 'Published'),
          el('span', {}, formatDate(model.publishedAt)),
        ),
        can('content.publish') && el('div', { style: { display: 'flex', gap: '8px', marginTop: '12px' } },
          model.status === 'published'
            ? el('button', { class: 'btn btn-sm', style: { flex: '1' }, onclick: () => save({ publish: false }) }, 'Unpublish')
            : el('button', { class: 'btn btn-sm btn-primary', style: { flex: '1' }, onclick: () => save({ publish: true }) }, 'Publish'),
        ),
      ))
    }

    if (!isNew) {
      sidebar.append(el('div', { class: 'card card-pad' },
        el('div', { class: 'group-title' }, 'Details'),
        el('div', { class: 'meta-row' }, el('span', {}, 'Created'), el('span', {}, formatDate(current.createdAt, true))),
        el('div', { class: 'meta-row' }, el('span', {}, 'Updated'), el('span', {}, formatDate(current.updatedAt, true))),
        type.slugField && model[type.slugField] && el('div', { class: 'meta-row' },
          el('span', {}, 'Slug'),
          el('span', { class: 'mono' }, model[type.slugField]),
        ),
      ))
    }

    if (!isSingle && !isNew && can('content.delete')) {
      sidebar.append(el('div', { class: 'card card-pad' },
        el('div', { class: 'group-title' }, 'Danger zone'),
        el('button', {
          class: 'btn btn-sm btn-danger',
          style: { width: '100%', justifyContent: 'center' },
          onclick: async () => {
            const okDelete = await confirmDialog({
              title: `Delete this ${type.singular.toLowerCase()}?`,
              message: 'This permanently removes the record. It cannot be undone.',
            })
            if (!okDelete) return
            await api.del(`/cms/${typeName}/${id}`)
            toast('Deleted', 'success')
            refreshCounts()
            navigate(`/c/${typeName}`)
          },
        }, `Delete ${type.singular.toLowerCase()}`),
      ))
    }
  }

  drawForm()
  drawSidebar()

  // Warn on navigating away with unsaved edits.
  const guard = e => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
  window.addEventListener('beforeunload', guard)
  window.addEventListener('hashchange', function off() {
    window.removeEventListener('beforeunload', guard)
    window.removeEventListener('hashchange', off)
  })

  const title = isSingle
    ? type.label
    : isNew
      ? `New ${type.singular}`
      : (model[type.titleField] || `Edit ${type.singular}`)

  return page(
    pageHeader({
      title,
      description: isSingle ? type.description : undefined,
      actions: [
        !isSingle && el('a', { class: 'btn', href: `#/c/${typeName}` }, '← Back'),
        can('content.write') && saveBtn,
      ],
    }),
    el('div', { class: 'editor-grid' },
      el('div', {}, tabsHost, el('div', { class: 'card card-pad' }, formHost)),
      sidebar,
    ),
  )
}

/** Builds an empty record honouring each field's declared default. */
function defaultsFor(type) {
  const out = {}
  for (const field of type.fields) {
    if (field.default !== undefined) out[field.name] = field.default
    else if (field.type === 'array') out[field.name] = []
    else if (field.type === 'object') out[field.name] = {}
    else if (field.type === 'boolean') out[field.name] = false
    else if (field.type === 'image') out[field.name] = { url: '', alt: '' }
    else out[field.name] = ''
  }
  if (type.publishable) out.status = out.status || 'draft'
  return out
}

/** Removes server-managed keys the editor must not send back. */
function strip(doc) {
  const out = { ...doc }
  for (const key of ['_id', 'id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']) {
    delete out[key]
  }
  return out
}
