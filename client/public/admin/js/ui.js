/** Small DOM + UI helpers shared by every view. */

/**
 * Creates an element. Children may be nodes, strings, or nested arrays;
 * `null`/`false` children are skipped so `cond && el(...)` reads naturally.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)

  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue
    if (key === 'class') node.className = value
    else if (key === 'html') node.innerHTML = value
    else if (key === 'dataset') Object.assign(node.dataset, value)
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value)
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key in node && key !== 'list' && typeof value !== 'object') {
      node[key] = value
    } else {
      node.setAttribute(key, value)
    }
  }

  append(node, children)
  return node
}

function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false || child === true) continue
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)))
  }
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild)
  return node
}

export function toast(message, kind = '') {
  const host = document.getElementById('toasts')
  const node = el('div', { class: `toast ${kind}` }, message)
  host.append(node)
  setTimeout(() => {
    node.style.opacity = '0'
    node.style.transition = 'opacity .25s'
    setTimeout(() => node.remove(), 260)
  }, kind === 'error' ? 6000 : 3200)
}

/** Promise-based confirm dialog — resolves true when the user proceeds. */
export function confirmDialog({ title, message, confirmLabel = 'Delete', danger = true }) {
  return new Promise(resolve => {
    const close = result => { backdrop.remove(); resolve(result) }

    const backdrop = el('div', {
      class: 'modal-backdrop',
      onclick: e => { if (e.target === backdrop) close(false) },
    },
      el('div', { class: 'modal', style: { maxWidth: '440px' } },
        el('div', { class: 'modal-head' }, el('h3', {}, title)),
        el('div', { class: 'modal-body' }, el('p', { style: { margin: 0 } }, message)),
        el('div', { class: 'modal-foot' },
          el('button', { class: 'btn', onclick: () => close(false) }, 'Cancel'),
          el('button', {
            class: danger ? 'btn btn-primary' : 'btn btn-primary',
            onclick: () => close(true),
          }, confirmLabel),
        ),
      ),
    )

    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(false) }
    })

    document.getElementById('modal-root').append(backdrop)
  })
}

export function modal({ title, body, footer, width = '760px' }) {
  const backdrop = el('div', {
    class: 'modal-backdrop',
    onclick: e => { if (e.target === backdrop) backdrop.remove() },
  },
    el('div', { class: 'modal', style: { maxWidth: width } },
      el('div', { class: 'modal-head' },
        el('h3', {}, title),
        el('div', { style: { flex: '1' } }),
        el('button', { class: 'btn btn-sm', onclick: () => backdrop.remove() }, '✕'),
      ),
      el('div', { class: 'modal-body' }, body),
      footer && el('div', { class: 'modal-foot' }, footer),
    ),
  )
  document.getElementById('modal-root').append(backdrop)
  return { close: () => backdrop.remove(), node: backdrop }
}

export function statusPill(status) {
  return el('span', { class: `pill pill-${status || 'draft'}` }, status || 'draft')
}

export function formatDate(value, withTime = false) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function relativeTime(value) {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

export function bytes(n) {
  if (!n) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`
}

export function initials(name) {
  return String(name || '?')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('')
}

/** Strips HTML and clips — for showing rich text inside a table cell. */
export function excerpt(html, length = 90) {
  const text = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > length ? `${text.slice(0, length)}…` : text
}

export function debounce(fn, ms = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/** Reads/writes a dotted path on a nested object, creating containers as needed. */
export function getPath(obj, path) {
  return String(path).split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

export function setPath(obj, path, value) {
  const parts = String(path).split('.')
  const last = parts.pop()
  let target = obj
  for (const part of parts) {
    if (target[part] == null || typeof target[part] !== 'object') {
      target[part] = /^\d+$/.test(part) ? [] : {}
    }
    target = target[part]
  }
  target[last] = value
  return obj
}
