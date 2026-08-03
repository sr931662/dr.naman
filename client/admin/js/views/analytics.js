import { api } from '../api.js'
import { el, clear, dataTable } from '../ui.js'
import { page, pageHeader } from '../app.js'

export async function renderAnalytics() {
  let days = 30
  const body = el('div')

  async function load() {
    clear(body)
    body.append(el('div', { style: { padding: '40px', textAlign: 'center' } }, el('span', { class: 'spinner' })))

    const { data } = await api.get('/analytics/summary', { days })
    clear(body)

    const maxViews = Math.max(1, ...data.byDay.map(d => d.views))

    body.append(
      el('div', { class: 'stat-grid' },
        stat('Page views', data.views.toLocaleString()),
        stat('Unique visitors', data.visitors.toLocaleString()),
        stat('Consultation requests', String(data.appointments)),
        stat('Visitor → request', `${data.conversionRate}%`),
      ),

      el('div', { class: 'card card-pad', style: { marginBottom: '20px' } },
        el('div', { class: 'group-title' }, `Daily traffic — last ${days} days`),
        data.byDay.length
          ? el('div', { class: 'bars' }, data.byDay.map(d => el('div', {
              class: 'bar',
              style: { height: `${(d.views / maxViews) * 100}%` },
              title: `${d.day}: ${d.views} views, ${d.visitors} visitors`,
            })))
          : el('p', { class: 'hint' }, 'No traffic recorded yet. Traffic appears once the site posts to /api/analytics/track.'),
      ),

      el('div', { class: 'split-grid wide' },
        el('div', { class: 'card' },
          el('div', { style: { padding: '14px 18px', borderBottom: '1px solid var(--line)' } },
            el('b', { style: { fontSize: '13.5px' } }, 'Most-visited pages')),
          data.topPages.length
            ? dataTable(el('table', {},
                el('thead', {}, el('tr', {}, el('th', {}, 'Path'), el('th', {}, 'Views'), el('th', {}, 'Visitors'))),
                el('tbody', {}, data.topPages.map(p => el('tr', {},
                  el('td', { class: 'mono cell-primary' }, p.path),
                  el('td', { class: 'cell-meta' }, String(p.views)),
                  el('td', { class: 'cell-meta' }, String(p.visitors)),
                ))),
              ))
            : el('div', { class: 'empty', style: { padding: '30px' } }, el('p', {}, 'No page views yet.')),
        ),
        el('div', { class: 'card card-pad' },
          el('div', { class: 'group-title' }, 'Devices'),
          Object.entries(data.devices).length
            ? Object.entries(data.devices).map(([device, views]) =>
                el('div', { class: 'meta-row' }, el('span', {}, device), el('span', {}, String(views))))
            : el('p', { class: 'hint' }, 'No data yet.'),
        ),
      ),

      el('p', { class: 'hint', style: { marginTop: '22px' } },
        'Analytics are cookieless: visitors are counted with a salted hash that rotates daily, so no visitor can be tracked across days or across other sites.'),
    )
  }

  await load()

  return page(
    pageHeader({
      title: 'Analytics',
      description: 'Traffic and enquiry conversion for the public site.',
      actions: [
        el('select', {
          style: { width: 'auto' },
          onchange: e => { days = Number(e.target.value); load() },
        },
          el('option', { value: '7' }, 'Last 7 days'),
          el('option', { value: '30', selected: true }, 'Last 30 days'),
          el('option', { value: '90' }, 'Last 90 days'),
          el('option', { value: '365' }, 'Last year'),
        ),
      ],
    }),
    body,
  )
}

function stat(label, value) {
  return el('div', { class: 'card', style: { padding: '16px 18px' } },
    el('div', { class: 'k' }, label),
    el('div', { class: 'v' }, value),
  )
}
