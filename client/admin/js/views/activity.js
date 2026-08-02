import { api } from '../api.js'
import { el, clear, formatDate, modal, dataTable } from '../ui.js'
import { page, pageHeader } from '../app.js'

export async function renderActivity() {
  const query = { page: 1, limit: 50, resource: '', action: '' }
  const tableWrap = el('div', { class: 'card' })
  const pager = el('div', { class: 'pager' })

  async function load() {
    clear(tableWrap)
    tableWrap.append(el('div', { style: { padding: '40px', textAlign: 'center' } }, el('span', { class: 'spinner' })))

    const res = await api.get('/cms/activity', query)
    clear(tableWrap)
    clear(pager)

    if (!res.data.length) {
      tableWrap.append(el('div', { class: 'empty' },
        el('div', { class: 'big' }, '🕘'),
        el('p', {}, 'No activity recorded for this filter.'),
      ))
      return
    }

    tableWrap.append(dataTable(el('table', {},
      el('thead', {}, el('tr', {},
        el('th', {}, 'When'),
        el('th', {}, 'Who'),
        el('th', {}, 'Action'),
        el('th', {}, 'Item'),
        el('th', {}, ''),
      )),
      el('tbody', {}, res.data.map(entry => el('tr', {},
        el('td', { class: 'hint' }, formatDate(entry.createdAt, true)),
        el('td', {}, entry.userName || '—'),
        el('td', {}, el('span', { class: 'pill pill-draft' }, entry.action)),
        el('td', {},
          el('div', { class: 'row-title' }, entry.label || '—'),
          el('div', { class: 'hint' }, entry.resource),
        ),
        el('td', { class: 'actions' },
          entry.changes && el('button', {
            class: 'btn btn-sm',
            onclick: () => showChanges(entry),
          }, 'View changes'),
        ),
      ))),
    )))

    if (res.meta.pages > 1) {
      pager.append(
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasPrev, onclick: () => { query.page--; load() } }, '← Previous'),
        el('span', {}, `Page ${res.meta.page} of ${res.meta.pages}`),
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasNext, onclick: () => { query.page++; load() } }, 'Next →'),
      )
    }
  }

  await load()

  return page(
    pageHeader({
      title: 'Activity Log',
      description: 'Every content change, with who made it. Entries are kept for six months.',
      actions: [
        el('select', {
          style: { width: 'auto' },
          onchange: e => { query.action = e.target.value; query.page = 1; load() },
        },
          el('option', { value: '' }, 'All actions'),
          ['create', 'update', 'delete', 'publish', 'unpublish', 'upload', 'reorder', 'login', 'export']
            .map(a => el('option', { value: a }, a)),
        ),
      ],
    }),
    tableWrap,
    pager,
  )
}

function showChanges(entry) {
  modal({
    title: `Changes — ${entry.label || entry.resource}`,
    body: dataTable(el('table', {},
      el('thead', {}, el('tr', {}, el('th', {}, 'Field'), el('th', {}, 'Before'), el('th', {}, 'After'))),
      el('tbody', {}, Object.entries(entry.changes).map(([field, change]) => el('tr', {},
        el('td', { class: 'row-title' }, field),
        el('td', { class: 'mono', style: { maxWidth: '260px', wordBreak: 'break-word' } }, format(change.from)),
        el('td', { class: 'mono', style: { maxWidth: '260px', wordBreak: 'break-word' } }, format(change.to)),
      ))),
    )),
  })
}

function format(value) {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 300)
  return String(value).slice(0, 300)
}
