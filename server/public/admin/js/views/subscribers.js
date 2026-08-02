import { api } from '../api.js'
import { el, clear, toast, confirmDialog, formatDate } from '../ui.js'
import { page, pageHeader, can } from '../app.js'

export async function renderSubscribers() {
  const query = { page: 1, limit: 50, status: '' }
  const tableWrap = el('div', { class: 'card' })
  const pager = el('div', { class: 'pager' })

  async function load() {
    clear(tableWrap)
    tableWrap.append(el('div', { style: { padding: '40px', textAlign: 'center' } }, el('span', { class: 'spinner' })))

    const res = await api.get('/newsletter', query)
    clear(tableWrap)
    clear(pager)

    if (!res.data.length) {
      tableWrap.append(el('div', { class: 'empty' },
        el('div', { class: 'big' }, '📧'),
        el('h3', {}, 'No subscribers yet'),
        el('p', {}, 'Addresses submitted to the newsletter form appear here.'),
      ))
      return
    }

    tableWrap.append(el('table', {},
      el('thead', {}, el('tr', {},
        el('th', {}, 'Email'),
        el('th', {}, 'Name'),
        el('th', {}, 'Status'),
        el('th', {}, 'Subscribed'),
        el('th', {}, ''),
      )),
      el('tbody', {}, res.data.map(s => el('tr', {},
        el('td', { class: 'row-title' }, s.email),
        el('td', {}, s.name || '—'),
        el('td', {}, el('span', { class: `pill pill-${s.status === 'subscribed' ? 'published' : 'draft'}` }, s.status)),
        el('td', { class: 'hint' }, formatDate(s.createdAt)),
        el('td', { class: 'actions' },
          can('appointments.write') && el('button', {
            class: 'btn btn-sm btn-danger',
            onclick: async () => {
              const okDelete = await confirmDialog({
                title: 'Remove this subscriber?',
                message: `${s.email} will be deleted from the list.`,
                confirmLabel: 'Remove',
              })
              if (!okDelete) return
              await api.del(`/newsletter/${s._id}`)
              toast('Removed', 'success')
              load()
            },
          }, '🗑'),
        ),
      ))),
    ))

    if (res.meta.pages > 1) {
      pager.append(
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasPrev, onclick: () => { query.page--; load() } }, '← Previous'),
        el('span', {}, `Page ${res.meta.page} of ${res.meta.pages} · ${res.meta.total} subscribers`),
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasNext, onclick: () => { query.page++; load() } }, 'Next →'),
      )
    }
  }

  await load()

  return page(
    pageHeader({
      title: 'Newsletter Subscribers',
      actions: [
        el('select', {
          style: { width: 'auto' },
          onchange: e => { query.status = e.target.value; query.page = 1; load() },
        },
          el('option', { value: '' }, 'All'),
          el('option', { value: 'subscribed' }, 'Subscribed'),
          el('option', { value: 'unsubscribed' }, 'Unsubscribed'),
        ),
        el('a', { class: 'btn', href: '/api/newsletter/export/csv', target: '_blank' }, '⬇ Export CSV'),
      ],
    }),
    tableWrap,
    pager,
  )
}
