import { api } from '../api.js'
import { el, clear, toast, modal, confirmDialog, formatDate, relativeTime, initials, dataTable } from '../ui.js'
import { page, pageHeader, state } from '../app.js'

const ROLE_HELP = {
  admin: 'Full access, including team management.',
  editor: 'Can create, edit, publish and delete content and media.',
  author: 'Can create and edit content, but not publish or delete it.',
  viewer: 'Read-only access.',
}

export async function renderUsers() {
  const tableWrap = el('div', { class: 'card' })

  async function load() {
    clear(tableWrap)
    tableWrap.append(el('div', { style: { padding: '40px', textAlign: 'center' } }, el('span', { class: 'spinner' })))

    const res = await api.get('/auth/users')
    clear(tableWrap)

    tableWrap.append(dataTable(el('table', {},
      el('thead', {}, el('tr', {},
        el('th', {}, 'Name'),
        el('th', {}, 'Role'),
        el('th', {}, 'Status'),
        el('th', {}, 'Last sign-in'),
        el('th', {}, ''),
      )),
      el('tbody', {}, res.data.map(user => el('tr', {},
        el('td', { class: 'cell-primary' },
          el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            el('div', { class: 'avatar', style: { background: 'var(--line-soft)', color: 'var(--ink)' } }, initials(user.name)),
            el('div', {},
              el('div', { class: 'row-title' }, user.name, user.id === state.user.id ? ' (you)' : ''),
              el('div', { class: 'hint' }, user.email),
            ),
          ),
        ),
        el('td', { class: 'cell-meta' }, el('span', { class: 'pill pill-draft' }, user.role)),
        el('td', { class: 'cell-status' }, user.active
          ? el('span', { class: 'pill pill-published' }, 'active')
          : el('span', { class: 'pill pill-archived' }, 'disabled')),
        el('td', { class: 'hint cell-meta' }, user.lastLoginAt ? relativeTime(user.lastLoginAt) : 'never'),
        el('td', { class: 'actions' },
          el('button', { class: 'btn btn-sm', onclick: () => editUser(user, load) }, 'Edit'),
          user.id !== state.user.id && el('button', {
            class: 'btn btn-sm btn-danger',
            onclick: async () => {
              const okDelete = await confirmDialog({
                title: 'Delete this account?',
                message: `${user.name} (${user.email}) will lose access immediately.`,
              })
              if (!okDelete) return
              try {
                await api.del(`/auth/users/${user.id}`)
                toast('Account deleted', 'success')
                load()
              } catch (err) {
                toast(err.message, 'error')
              }
            },
          }, '🗑'),
        ),
      ))),
    )))
  }

  await load()

  return page(
    pageHeader({
      title: 'Team',
      description: 'People with access to this CMS.',
      actions: [el('button', { class: 'btn btn-primary', onclick: () => editUser(null, load) }, '+ Invite user')],
    }),
    tableWrap,
    el('div', { class: 'card card-pad', style: { marginTop: '20px' } },
      el('div', { class: 'group-title' }, 'What each role can do'),
      Object.entries(ROLE_HELP).map(([role, help]) =>
        el('div', { class: 'meta-row' },
          el('span', {}, el('b', { style: { textTransform: 'capitalize' } }, role)),
          el('span', { style: { textAlign: 'right', maxWidth: '70%' } }, help),
        )),
    ),
  )
}

function editUser(user, onDone) {
  const isNew = !user

  const name = el('input', { type: 'text', value: user?.name || '' })
  const email = el('input', { type: 'email', value: user?.email || '', disabled: !isNew })
  const password = el('input', { type: 'password', autocomplete: 'new-password', placeholder: isNew ? 'At least 10 characters' : 'Leave blank to keep unchanged' })
  const role = el('select', {},
    Object.keys(ROLE_HELP).map(r => el('option', { value: r, selected: (user?.role || 'editor') === r }, r)),
  )
  const active = el('input', { type: 'checkbox', checked: user ? user.active : true })

  const errorBox = el('div', { class: 'err', style: { display: 'none', marginBottom: '12px' } })

  const dialog = modal({
    title: isNew ? 'Invite a user' : `Edit ${user.name}`,
    width: '460px',
    body: el('div', {},
      errorBox,
      el('div', { class: 'field' }, el('label', {}, 'Name'), name),
      el('div', { class: 'field' }, el('label', {}, 'Email'), email,
        !isNew && el('div', { class: 'help' }, 'The email address cannot be changed.')),
      el('div', { class: 'field' }, el('label', {}, isNew ? 'Password' : 'New password'), password,
        el('div', { class: 'help' }, 'Needs 10+ characters with upper case, lower case and a number.')),
      el('div', { class: 'field' }, el('label', {}, 'Role'), role,
        el('div', { class: 'help', id: 'role-help' }, ROLE_HELP[user?.role || 'editor'])),
      !isNew && el('div', { class: 'field' },
        el('div', { class: 'check' }, active, el('label', {}, 'Account is active')),
      ),
    ),
    footer: el('button', {
      class: 'btn btn-primary',
      onclick: async e => {
        errorBox.style.display = 'none'
        e.target.disabled = true
        try {
          if (isNew) {
            await api.post('/auth/users', {
              name: name.value.trim(),
              email: email.value.trim(),
              password: password.value,
              role: role.value,
            })
            toast('User created', 'success')
          } else {
            const body = { name: name.value.trim(), role: role.value, active: active.checked }
            if (password.value) body.password = password.value
            await api.patch(`/auth/users/${user.id}`, body)
            toast('User updated', 'success')
          }
          dialog.close()
          onDone()
        } catch (err) {
          errorBox.textContent = err.details
            ? Object.values(err.details).join(' ')
            : err.message
          errorBox.style.display = 'block'
          e.target.disabled = false
        }
      },
    }, isNew ? 'Create user' : 'Save changes'),
  })

  role.addEventListener('change', () => {
    document.getElementById('role-help').textContent = ROLE_HELP[role.value]
  })
}
