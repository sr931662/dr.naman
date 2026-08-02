import { api } from '../api.js'
import { el, clear, toast, confirmDialog, statusPill, formatDate, excerpt, debounce, dataTable } from '../ui.js'
import { page, pageHeader, typeByName, can, refreshCounts } from '../app.js'

/** The list view for any collection content type. */
export async function renderCollection(typeName) {
  const type = typeByName(typeName)
  const query = { page: 1, limit: 25, search: '', status: '', sort: type.defaultSort }

  const tableWrap = el('div', { class: 'card' })
  const pager = el('div', { class: 'pager' })

  const search = el('input', {
    type: 'search',
    placeholder: `Search ${type.label.toLowerCase()}…`,
    oninput: debounce(e => { query.search = e.target.value; query.page = 1; load() }, 320),
  })

  const statusFilter = type.publishable && el('select', {
    style: { width: 'auto' },
    onchange: e => { query.status = e.target.value; query.page = 1; load() },
  },
    el('option', { value: '' }, 'All statuses'),
    el('option', { value: 'published' }, 'Published'),
    el('option', { value: 'draft' }, 'Drafts'),
    el('option', { value: 'archived' }, 'Archived'),
  )

  async function load() {
    clear(tableWrap)
    tableWrap.append(el('div', { style: { padding: '40px', textAlign: 'center' } }, el('span', { class: 'spinner' })))

    const res = await api.get(`/cms/${typeName}`, query)
    const items = res.data
    const meta = res.meta

    clear(tableWrap)
    clear(pager)

    if (!items.length) {
      tableWrap.append(el('div', { class: 'empty' },
        el('div', { class: 'big' }, type.icon),
        el('h3', {}, query.search ? 'No matches' : `No ${type.label.toLowerCase()} yet`),
        el('p', {}, query.search
          ? 'Try a different search term.'
          : type.description || `Create your first ${type.singular.toLowerCase()}.`),
        can('content.write') && el('a', { class: 'btn btn-primary', href: `#/c/${typeName}/new` }, `+ New ${type.singular}`),
      ))
      return
    }

    const columns = (type.listColumns?.length ? type.listColumns : [type.titleField])
      .filter(c => c !== 'status')

    const tbody = el('tbody')

    tableWrap.append(dataTable(el('table', {},
      el('thead', {}, el('tr', {},
        type.orderable && el('th', { style: { width: '30px' } }, ''),
        columns.map(c => el('th', {}, labelFor(type, c))),
        type.publishable && el('th', { style: { width: '110px' } }, 'Status'),
        el('th', { style: { width: '150px' } }, ''),
      )),
      tbody,
    )))

    items.forEach((item, index) => {
      const row = el('tr', {
        draggable: Boolean(type.orderable),
        dataset: { id: item._id, index: String(index) },
      },
        type.orderable && el('td', { class: 'drag-handle', title: 'Drag to reorder' }, '⠿'),
        columns.map((col, i) => el('td', {},
          i === 0
            ? el('a', { href: `#/c/${typeName}/${item._id}`, class: 'row-title' }, cellValue(item, col, type) || '(untitled)')
            : cellValue(item, col, type),
        )),
        type.publishable && el('td', {}, statusPill(item.status)),
        el('td', { class: 'actions' },
          can('content.publish') && type.publishable && el('button', {
            class: 'btn btn-sm',
            title: item.status === 'published' ? 'Unpublish' : 'Publish',
            onclick: async () => {
              const next = item.status === 'published' ? 'draft' : 'published'
              await api.post(`/cms/${typeName}/${item._id}/status`, { status: next })
              toast(next === 'published' ? 'Published' : 'Moved to draft', 'success')
              load(); refreshCounts()
            },
          }, item.status === 'published' ? '👁' : '🚀'),
          can('content.write') && el('button', {
            class: 'btn btn-sm', title: 'Duplicate',
            onclick: async () => {
              await api.post(`/cms/${typeName}/${item._id}/duplicate`)
              toast('Duplicated as a draft', 'success')
              load(); refreshCounts()
            },
          }, '⧉'),
          can('content.delete') && el('button', {
            class: 'btn btn-sm btn-danger', title: 'Delete',
            onclick: async () => {
              const okDelete = await confirmDialog({
                title: `Delete this ${type.singular.toLowerCase()}?`,
                message: `"${cellValue(item, type.titleField, type)}" will be permanently removed. This cannot be undone.`,
              })
              if (!okDelete) return
              await api.del(`/cms/${typeName}/${item._id}`)
              toast('Deleted', 'success')
              load(); refreshCounts()
            },
          }, '🗑'),
        ),
      )
      tbody.append(row)
    })

    if (type.orderable && can('content.write')) enableDragReorder(tbody, typeName)

    // Pagination
    if (meta.pages > 1) {
      pager.append(
        el('button', {
          class: 'btn btn-sm', disabled: !meta.hasPrev,
          onclick: () => { query.page--; load() },
        }, '← Previous'),
        el('span', {}, `Page ${meta.page} of ${meta.pages} · ${meta.total} items`),
        el('button', {
          class: 'btn btn-sm', disabled: !meta.hasNext,
          onclick: () => { query.page++; load() },
        }, 'Next →'),
      )
    }
  }

  await load()

  return page(
    pageHeader({
      title: type.label,
      description: type.description,
      actions: [
        can('content.write') && el('a', { class: 'btn btn-primary', href: `#/c/${typeName}/new` }, `+ New ${type.singular}`),
      ],
    }),
    el('div', { class: 'toolbar' },
      el('div', { class: 'grow' }, search),
      statusFilter,
    ),
    tableWrap,
    pager,
  )
}

/** Drag-and-drop row ordering, persisted with one bulk reorder call. */
function enableDragReorder(tbody, typeName) {
  let dragged = null

  tbody.addEventListener('dragstart', e => {
    dragged = e.target.closest('tr')
    dragged?.classList.add('dragging')
  })

  tbody.addEventListener('dragend', async () => {
    dragged?.classList.remove('dragging')
    dragged = null

    const items = [...tbody.querySelectorAll('tr')].map((row, index) => ({
      id: row.dataset.id,
      order: index,
    }))

    try {
      await api.post(`/cms/${typeName}/reorder`, { items })
      toast('Order saved', 'success')
    } catch (err) {
      toast(`Could not save order: ${err.message}`, 'error')
    }
  })

  tbody.addEventListener('dragover', e => {
    e.preventDefault()
    const target = e.target.closest('tr')
    if (!target || !dragged || target === dragged) return

    const { top, height } = target.getBoundingClientRect()
    const after = e.clientY > top + height / 2
    tbody.insertBefore(dragged, after ? target.nextSibling : target)
  })
}

function labelFor(type, column) {
  if (column === 'updatedAt') return 'Updated'
  if (column === 'publishedAt') return 'Published'
  if (column === 'order') return 'Order'
  const field = type.fields.find(f => f.name === column)
  return field?.label || column
}

function cellValue(item, column, type) {
  const value = item[column]
  if (value === undefined || value === null || value === '') return '—'

  if (column === 'updatedAt' || column === 'publishedAt' || column === 'createdAt') {
    return formatDate(value)
  }

  const field = type.fields.find(f => f.name === column)
  if (field?.type === 'boolean') return value ? '✓' : '—'
  if (field?.type === 'image') return value.url ? '🖼' : '—'
  if (field?.type === 'richtext') return excerpt(value, 70)
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  if (typeof value === 'object') return '—'

  return excerpt(String(value), 70)
}
