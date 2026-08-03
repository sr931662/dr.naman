import { api, setToken } from './api.js'
import { el, clear, toast, initials } from './ui.js'
import { enter, fade, slideDrawer, pressFeedback, stack } from './motion.js'
import { renderLogin } from './views/login.js'
import { renderDashboard } from './views/dashboard.js'
import { renderCollection } from './views/collection.js'
import { renderEditor } from './views/editor.js'
import { renderMedia } from './views/media.js'
import { renderAppointments } from './views/appointments.js'
import { renderSubscribers } from './views/subscribers.js'
import { renderAnalytics } from './views/analytics.js'
import { renderActivity } from './views/activity.js'
import { renderUsers } from './views/users.js'
import { renderAccount } from './views/account.js'

/** Shared application state, readable from any view. */
export const state = {
  user: null,
  permissions: [],
  schema: null,       // { groups: [{ name, types: [...] }], types: [...] }
  counts: {},
}

export const can = permission =>
  state.permissions.includes('*') || state.permissions.includes(permission)

export const typeByName = name => state.schema?.types.find(t => t.name === name)

// ─── Routing ─────────────────────────────────────────────────────────────────

const ROUTES = [
  [/^\/?$/, () => renderDashboard()],
  [/^\/c\/([\w-]+)\/new$/, type => renderEditor(type, null)],
  [/^\/c\/([\w-]+)\/([\w-]+)$/, (type, id) => renderEditor(type, id)],
  [/^\/c\/([\w-]+)$/, type => {
    const def = typeByName(type)
    if (!def) return notFoundView(type)
    return def.kind === 'single' ? renderEditor(type, 'single') : renderCollection(type)
  }],
  [/^\/media$/, () => renderMedia()],
  [/^\/appointments$/, () => renderAppointments()],
  [/^\/subscribers$/, () => renderSubscribers()],
  [/^\/analytics$/, () => renderAnalytics()],
  [/^\/activity$/, () => renderActivity()],
  [/^\/users$/, () => renderUsers()],
  [/^\/account$/, () => renderAccount()],
]

export function navigate(path) {
  window.location.hash = `#${path}`
}

export function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

async function route() {
  const path = currentPath()
  const outlet = document.getElementById('view-outlet')
  if (!outlet) return

  for (const [pattern, handler] of ROUTES) {
    const match = pattern.exec(path)
    if (!match) continue

    clear(outlet)
    outlet.append(el('div', { style: { padding: '40px', textAlign: 'center' } },
      el('span', { class: 'spinner' })))

    try {
      const view = await handler(...match.slice(1))
      clear(outlet)
      outlet.append(view)
      renderNav()
      setSidebar(false)
      window.scrollTo(0, 0)

      // Only the body travels. Animating the whole view would drag the sticky
      // topbar along with it, which reads as the page failing to settle.
      const content = view.querySelector('.content')
      if (content) stack(content.children, { y: 8 })
      else enter(view)
    } catch (err) {
      clear(outlet)
      outlet.append(errorView(err))
    }
    return
  }

  clear(outlet)
  outlet.append(notFoundView(path))
}

function errorView(err) {
  console.error(err)
  return el('div', { class: 'empty' },
    el('div', { class: 'big' }, '⚠️'),
    el('h3', {}, 'Could not load this page'),
    el('p', {}, err.message || 'Unknown error'),
    el('button', { class: 'btn', onclick: () => route() }, 'Try again'),
  )
}

function notFoundView(what) {
  return el('div', { class: 'empty' },
    el('div', { class: 'big' }, '🔍'),
    el('h3', {}, 'Nothing here'),
    el('p', {}, `No such page: ${what}`),
    el('a', { class: 'btn', href: '#/' }, 'Back to dashboard'),
  )
}

// ─── Shell ───────────────────────────────────────────────────────────────────

const SYSTEM_NAV = [
  { group: 'Enquiries', items: [
    { path: '/appointments', icon: '📥', label: 'Consultation Requests', permission: 'appointments.read' },
    { path: '/subscribers', icon: '📧', label: 'Subscribers', permission: 'appointments.read' },
  ] },
  { group: 'Library', items: [
    { path: '/media', icon: '🖼', label: 'Media', permission: 'media.read' },
  ] },
  { group: 'Insight', items: [
    { path: '/analytics', icon: '📈', label: 'Analytics', permission: 'analytics.read' },
    { path: '/activity', icon: '🕘', label: 'Activity Log', permission: 'audit.read' },
  ] },
  { group: 'Administration', items: [
    { path: '/users', icon: '👥', label: 'Team', permission: '*' },
    { path: '/account', icon: '⚙️', label: 'My Account' },
  ] },
]

function renderNav() {
  const nav = document.getElementById('nav')
  if (!nav) return
  clear(nav)

  const path = currentPath()
  const isActive = href => path === href || path.startsWith(`${href}/`)

  const link = ({ path: href, icon, label, count }) => el('a', {
    href: `#${href}`,
    class: isActive(href) ? 'active' : '',
  },
    el('span', { class: 'ico' }, icon),
    el('span', {}, label),
    count !== undefined && count !== null && el('span', { class: 'count' }, count),
  )

  nav.append(el('div', { class: 'nav-group' }, link({ path: '/', icon: '🏠', label: 'Dashboard' })))

  for (const group of state.schema?.groups || []) {
    const visible = group.types.filter(() => can('content.read'))
    if (!visible.length) continue
    nav.append(el('div', { class: 'nav-group' },
      el('h4', {}, group.name),
      visible.map(type => link({
        path: `/c/${type.name}`,
        icon: type.icon,
        label: type.label,
        count: type.kind === 'single' ? undefined : state.counts[type.name]?.total,
      })),
    ))
  }

  for (const section of SYSTEM_NAV) {
    const visible = section.items.filter(i => !i.permission || (i.permission === '*' ? state.user?.role === 'admin' : can(i.permission)))
    if (!visible.length) continue
    nav.append(el('div', { class: 'nav-group' },
      el('h4', {}, section.group),
      visible.map(link),
    ))
  }
}

const drawerQuery = window.matchMedia('(max-width: 900px)')

/**
 * Opens or closes the mobile navigation drawer. Above the breakpoint the
 * sidebar is always on screen and this is a no-op.
 */
export function setSidebar(open) {
  const shell = document.querySelector('.shell')
  if (!shell || open === shell.classList.contains('nav-open')) return

  shell.classList.toggle('nav-open', open)
  document.body.classList.toggle('nav-locked', open)
  for (const toggle of document.querySelectorAll('.nav-toggle')) {
    toggle.setAttribute('aria-expanded', String(open))
  }

  if (!drawerQuery.matches) return
  slideDrawer(shell.querySelector('.sidebar'), open)
  fade(shell.querySelector('.nav-scrim'), open ? [0, 1] : [1, 0], 0.2)
}

/**
 * Growing past the breakpoint has to drop the inline transform the drawer
 * animation left behind — otherwise a sidebar last seen closing stays parked
 * off-screen on desktop, where nothing would ever bring it back.
 */
drawerQuery.addEventListener('change', () => {
  const shell = document.querySelector('.shell')
  if (!shell) return

  shell.classList.remove('nav-open')
  document.body.classList.remove('nav-locked')
  shell.querySelector('.sidebar').style.transform = ''
  shell.querySelector('.nav-scrim').style.opacity = ''
})

function renderShell() {
  const app = document.getElementById('app')
  app.className = ''
  clear(app)

  const nav = el('nav', { class: 'nav', id: 'nav' })
  // Re-selecting the page you are already on leaves the hash alone, so close
  // the drawer here rather than relying on the router.
  nav.addEventListener('click', e => { if (e.target.closest('a')) setSidebar(false) })

  app.append(el('div', { class: 'shell' },
    el('div', { class: 'nav-scrim', onclick: () => setSidebar(false) }),
    el('aside', { class: 'sidebar' },
      el('div', { class: 'sidebar-head' },
        el('div', { class: 'sidebar-mark' }, 'N'),
        el('div', {},
          el('strong', {}, 'Dr. Naman Aggarwal'),
          el('span', {}, 'Content Management'),
        ),
        el('button', {
          class: 'btn btn-sm nav-close',
          'aria-label': 'Close navigation',
          onclick: () => setSidebar(false),
        }, '✕'),
      ),
      nav,
      el('div', { class: 'sidebar-foot' },
        el('div', { class: 'avatar' }, initials(state.user?.name)),
        el('div', { class: 'who' },
          el('b', {}, state.user?.name || ''),
          el('span', {}, state.user?.role || ''),
        ),
        el('button', {
          class: 'btn btn-sm',
          title: 'Sign out',
          onclick: async () => {
            await api.logout()
            setToken(null)
            state.user = null
            boot()
          },
        }, '⏻'),
      ),
    ),
    el('main', { class: 'main' },
      el('div', { id: 'view-outlet' }),
    ),
  ))

  renderNav()
}

/** Views use this to render their own sticky header. */
export function pageHeader({ title, description, actions = [] }) {
  const visible = actions.filter(Boolean)

  return el('div', { class: 'topbar' },
    el('button', {
      class: 'btn btn-icon nav-toggle',
      title: 'Menu',
      'aria-label': 'Open navigation',
      'aria-expanded': 'false',
      onclick: () => setSidebar(true),
    }, '☰'),
    el('div', { class: 'topbar-title' },
      el('h1', {}, title),
      description && el('p', { class: 'desc' }, description),
    ),
    el('div', { class: 'spacer' }),
    visible.length ? el('div', { class: 'topbar-actions' }, ...visible) : null,
  )
}

export function page(header, ...body) {
  return el('div', {}, header, el('div', { class: 'content' }, ...body))
}

export async function refreshCounts() {
  try {
    const res = await api.get('/cms/dashboard')
    state.counts = res.data.counts || {}
    renderNav()
    return res.data
  } catch {
    return null
  }
}

// ─── Boot ────────────────────────────────────────────────────────────────────

async function boot() {
  try {
    // A valid refresh cookie means we can restore the session without a login.
    await api.refresh()
    const me = await api.get('/auth/me')
    state.user = me.data.user
    state.permissions = me.data.permissions

    const schema = await api.get('/cms/schema')
    state.schema = schema.data

    renderShell()
    await refreshCounts()
    await route()
  } catch {
    renderLogin(async () => { await boot() })
  }
}

// Delegated once, at the root, so controls rendered by any later view are
// covered without every view having to opt in.
pressFeedback(document.body)

window.addEventListener('hashchange', route)
window.addEventListener('keydown', e => {
  // Only the drawer answers to Escape here; dialogs bind their own handler.
  if (e.key === 'Escape' && !document.querySelector('.modal-backdrop')) setSidebar(false)
})
window.addEventListener('unhandledrejection', e => {
  if (e.reason?.status === 401) return
  toast(e.reason?.message || 'Something went wrong', 'error')
})

boot()
