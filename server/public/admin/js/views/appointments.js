import { api } from '../api.js'
import { el, clear, toast, modal, confirmDialog, formatDate, relativeTime, debounce, excerpt } from '../ui.js'
import { page, pageHeader, can } from '../app.js'

const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', scheduled: 'Scheduled',
  completed: 'Completed', cancelled: 'Cancelled', spam: 'Spam',
}

export async function renderAppointments() {
  const query = { page: 1, limit: 25, search: '', status: '' }

  const tableWrap = el('div', { class: 'card' })
  const pager = el('div', { class: 'pager' })
  const tabs = el('div', { class: 'tabs' })

  function drawTabs(counts = {}) {
    clear(tabs)
    const entries = [['', 'Open'], ...Object.keys(STATUS_LABELS).map(k => [k, STATUS_LABELS[k]]), ['all', 'All']]
    for (const [value, label] of entries) {
      const count = value && value !== 'all' ? counts[value] : undefined
      tabs.append(el('button', {
        class: `tab${query.status === value ? ' active' : ''}`,
        onclick: () => { query.status = value; query.page = 1; load() },
      }, label, count ? ` (${count})` : ''))
    }
  }

  async function load() {
    clear(tableWrap)
    tableWrap.append(el('div', { style: { padding: '40px', textAlign: 'center' } }, el('span', { class: 'spinner' })))

    const res = await api.get('/appointments', query)
    drawTabs(res.meta?.counts)
    clear(tableWrap)
    clear(pager)

    if (!res.data.length) {
      tableWrap.append(el('div', { class: 'empty' },
        el('div', { class: 'big' }, '📭'),
        el('h3', {}, 'No requests here'),
        el('p', {}, 'Consultation requests submitted through the site appear here.'),
      ))
      return
    }

    tableWrap.append(el('table', {},
      el('thead', {}, el('tr', {},
        el('th', {}, 'Patient'),
        el('th', {}, 'Contact'),
        el('th', {}, 'Message'),
        el('th', {}, 'Status'),
        el('th', {}, 'Received'),
      )),
      el('tbody', {}, res.data.map(item => el('tr', {
        style: { cursor: 'pointer' },
        onclick: () => details(item, load),
      },
        el('td', {},
          el('div', { class: 'row-title' }, item.name),
          item.preferredTime && el('div', { class: 'hint' }, item.preferredTime),
        ),
        el('td', {},
          el('div', {}, item.phone),
          item.email && el('div', { class: 'hint' }, item.email),
        ),
        el('td', { style: { maxWidth: '320px' } }, excerpt(item.message, 100)),
        el('td', {}, el('span', { class: `pill pill-${item.status}` }, STATUS_LABELS[item.status] || item.status)),
        el('td', { class: 'hint' }, relativeTime(item.createdAt)),
      ))),
    ))

    if (res.meta.pages > 1) {
      pager.append(
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasPrev, onclick: () => { query.page--; load() } }, '← Previous'),
        el('span', {}, `Page ${res.meta.page} of ${res.meta.pages} · ${res.meta.total} requests`),
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasNext, onclick: () => { query.page++; load() } }, 'Next →'),
      )
    }
  }

  await load()

  return page(
    pageHeader({
      title: 'Consultation Requests',
      description: 'Enquiries submitted through the contact form. Treat these as confidential patient information.',
      actions: [
        el('a', { class: 'btn', href: '/api/appointments/export/csv', target: '_blank' }, '⬇ Export CSV'),
      ],
    }),
    tabs,
    el('div', { class: 'toolbar' },
      el('div', { class: 'grow' },
        el('input', {
          type: 'search',
          placeholder: 'Search by name, phone, email or message…',
          oninput: debounce(e => { query.search = e.target.value; query.page = 1; load() }, 320),
        }),
      ),
    ),
    tableWrap,
    pager,
  )
}

function details(item, onChange) {
  const statusSelect = el('select', {},
    Object.entries(STATUS_LABELS).map(([v, l]) =>
      el('option', { value: v, selected: item.status === v }, l)),
  )

  const scheduled = el('input', {
    type: 'date',
    value: item.scheduledFor ? String(item.scheduledFor).slice(0, 10) : '',
  })

  const noteInput = el('textarea', { rows: 3, placeholder: 'Add an internal note (visible to the team only)…' })

  const notesList = el('div', {},
    (item.notes || []).map(n => el('div', {
      style: { padding: '9px 0', borderBottom: '1px solid var(--line-soft)', fontSize: '13px' },
    },
      el('div', {}, n.text),
      el('div', { class: 'hint', style: { fontSize: '11.5px' } }, `${n.authorName || 'Team'} · ${formatDate(n.at, true)}`),
    )),
  )

  const dialog = modal({
    title: `Request from ${item.name}`,
    width: '640px',
    body: el('div', {},
      el('div', { class: 'card card-pad', style: { marginBottom: '18px', background: 'var(--line-soft)' } },
        row('Phone', el('a', { href: `tel:${item.phone}` }, item.phone)),
        item.email && row('Email', el('a', { href: `mailto:${item.email}` }, item.email)),
        item.preferredTime && row('Preferred time', item.preferredTime),
        row('Received', formatDate(item.createdAt, true)),
        item.referrer && row('Came from', el('span', { class: 'hint mono' }, item.referrer)),
      ),

      el('div', { class: 'field' },
        el('label', {}, 'Message / symptoms'),
        el('div', {
          style: {
            padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: '6px', whiteSpace: 'pre-wrap', lineHeight: '1.6',
          },
        }, item.message),
      ),

      can('appointments.write') && el('div', {},
        el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' } },
          el('div', { class: 'field' }, el('label', {}, 'Status'), statusSelect),
          el('div', { class: 'field' }, el('label', {}, 'Scheduled for'), scheduled),
        ),
        el('div', { class: 'field' }, el('label', {}, 'Internal notes'), notesList, noteInput),
      ),
    ),
    footer: [
      can('appointments.write') && el('button', {
        class: 'btn btn-danger',
        onclick: async () => {
          const okDelete = await confirmDialog({
            title: 'Delete this request?',
            message: 'The patient\'s message will be permanently removed.',
          })
          if (!okDelete) return
          await api.del(`/appointments/${item._id}`)
          toast('Request deleted', 'success')
          dialog.close()
          onChange()
        },
      }, 'Delete'),
      can('appointments.write') && el('button', {
        class: 'btn btn-primary',
        onclick: async () => {
          await api.patch(`/appointments/${item._id}`, {
            status: statusSelect.value,
            scheduledFor: scheduled.value || null,
            note: noteInput.value.trim() || undefined,
          })
          toast('Saved', 'success')
          dialog.close()
          onChange()
        },
      }, 'Save'),
    ].filter(Boolean),
  })
}

function row(label, value) {
  return el('div', { class: 'meta-row' }, el('span', {}, label), el('span', {}, value))
}
