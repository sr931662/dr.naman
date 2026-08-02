import { api } from '../api.js'
import { el, relativeTime } from '../ui.js'
import { page, pageHeader, state, refreshCounts, can } from '../app.js'

export async function renderDashboard() {
  const [dash, appointments] = await Promise.all([
    refreshCounts(),
    can('appointments.read')
      ? api.get('/appointments', { limit: 5 }).catch(() => null)
      : null,
  ])

  const counts = dash?.counts || {}
  const newLeads = appointments?.meta?.counts?.new || 0
  const totalPublished = Object.values(counts).reduce((a, c) => a + (c.published || 0), 0)
  const totalDrafts = Object.values(counts).reduce((a, c) => a + (c.drafts || 0), 0)

  return page(
    pageHeader({
      title: `Good ${greeting()}, ${state.user.name.split(' ')[0]}`,
      description: 'Everything on the site, in one place.',
      actions: [
        el('a', { class: 'btn', href: '/api/public/home', target: '_blank' }, 'Preview API'),
      ],
    }),

    el('div', { class: 'stat-grid' },
      stat('Published items', totalPublished, 'live on the site'),
      stat('Drafts', totalDrafts, 'not yet visible'),
      can('appointments.read') && stat('New requests', newLeads, 'awaiting a response', newLeads > 0),
      stat('Content types', state.schema?.types.length || 0, 'managed here'),
    ),

    el('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: '20px', alignItems: 'start' } },

      // Recent consultation requests
      el('div', { class: 'card' },
        cardHead('Latest consultation requests', appointments && el('a', { class: 'btn btn-sm', href: '#/appointments' }, 'View all')),
        appointments?.data?.length
          ? el('table', {},
              el('tbody', {}, appointments.data.map(a => el('tr', {
                style: { cursor: 'pointer' },
                onclick: () => { window.location.hash = '#/appointments' },
              },
                el('td', {},
                  el('div', { class: 'row-title' }, a.name),
                  el('div', { class: 'hint' }, a.phone),
                ),
                el('td', {}, el('span', { class: `pill pill-${a.status}` }, a.status)),
                el('td', { style: { textAlign: 'right' }, class: 'hint' }, relativeTime(a.createdAt)),
              ))),
            )
          : el('div', { class: 'empty', style: { padding: '34px' } },
              el('div', { class: 'big' }, '📭'),
              el('p', {}, can('appointments.read') ? 'No requests yet.' : 'You do not have access to enquiries.'),
            ),
      ),

      // Recent editorial activity
      el('div', { class: 'card' },
        cardHead('Recent activity', can('audit.read') && el('a', { class: 'btn btn-sm', href: '#/activity' }, 'View all')),
        dash?.recentActivity?.length
          ? el('div', { style: { padding: '6px 0' } }, dash.recentActivity.slice(0, 8).map(a =>
              el('div', { style: { padding: '8px 18px', borderBottom: '1px solid var(--line-soft)', fontSize: '13px' } },
                el('div', {}, el('b', {}, a.userName || 'Someone'), ` ${verb(a.action)} `, el('span', { class: 'hint' }, a.label || a.resource)),
                el('div', { class: 'hint', style: { fontSize: '11.5px' } }, `${a.resource} · ${relativeTime(a.createdAt)}`),
              )))
          : el('div', { class: 'empty', style: { padding: '34px' } }, el('p', {}, 'Nothing yet.')),
      ),
    ),

    // Per-type content overview
    el('h3', { style: { margin: '30px 0 12px', fontSize: '15px' } }, 'Content overview'),
    el('div', { class: 'card' },
      el('table', {},
        el('thead', {}, el('tr', {},
          el('th', {}, 'Type'),
          el('th', {}, 'Published'),
          el('th', {}, 'Drafts'),
          el('th', {}, 'Total'),
          el('th', {}, ''),
        )),
        el('tbody', {}, (state.schema?.types || []).map(type => {
          const c = counts[type.name] || { total: 0, published: 0, drafts: 0 }
          return el('tr', {},
            el('td', {}, el('span', { style: { marginRight: '8px' } }, type.icon), el('b', {}, type.label)),
            el('td', {}, String(c.published)),
            el('td', {}, c.drafts ? el('span', { class: 'pill pill-draft' }, String(c.drafts)) : '—'),
            el('td', {}, String(c.total)),
            el('td', { class: 'actions' }, el('a', { class: 'btn btn-sm', href: `#/c/${type.name}` }, 'Manage')),
          )
        })),
      ),
    ),
  )
}

function stat(label, value, detail, highlight = false) {
  return el('div', { class: 'card', style: { padding: '16px 18px' } },
    el('div', { class: 'k' }, label),
    el('div', { class: 'v', style: highlight ? { color: 'var(--crimson)' } : {} }, String(value)),
    el('div', { class: 'd' }, detail),
  )
}

function cardHead(title, action) {
  return el('div', {
    style: {
      padding: '14px 18px', borderBottom: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: '10px',
    },
  },
    el('b', { style: { fontSize: '13.5px' } }, title),
    el('div', { style: { flex: '1' } }),
    action,
  )
}

function verb(action) {
  return {
    create: 'created', update: 'updated', delete: 'deleted',
    publish: 'published', unpublish: 'unpublished', upload: 'uploaded',
    login: 'signed in', reorder: 'reordered', duplicate: 'duplicated', export: 'exported',
  }[action] || action
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}
