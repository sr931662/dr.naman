import { api, setToken } from '../api.js'
import { el, toast, formatDate } from '../ui.js'
import { page, pageHeader, state } from '../app.js'

export async function renderAccount() {
  const name = el('input', { type: 'text', value: state.user.name })

  const currentPassword = el('input', { type: 'password', autocomplete: 'current-password' })
  const newPassword = el('input', { type: 'password', autocomplete: 'new-password' })
  const confirmPassword = el('input', { type: 'password', autocomplete: 'new-password' })
  const pwError = el('div', { class: 'err', style: { display: 'none' } })

  return page(
    pageHeader({ title: 'My Account' }),

    el('div', { class: 'grid-2', style: { maxWidth: '900px' } },

      el('div', { class: 'card card-pad' },
        el('div', { class: 'group-title' }, 'Profile'),
        el('div', { class: 'field' }, el('label', {}, 'Name'), name),
        el('div', { class: 'field' },
          el('label', {}, 'Email'),
          el('input', { type: 'email', value: state.user.email, disabled: true }),
        ),
        el('div', { class: 'meta-row' }, el('span', {}, 'Role'), el('span', { style: { textTransform: 'capitalize' } }, state.user.role)),
        el('div', { class: 'meta-row' }, el('span', {}, 'Member since'), el('span', {}, formatDate(state.user.createdAt))),
        el('button', {
          class: 'btn btn-primary',
          style: { marginTop: '14px' },
          onclick: async () => {
            const res = await api.patch('/auth/me', { name: name.value.trim() })
            state.user = res.data
            toast('Profile updated', 'success')
          },
        }, 'Save profile'),
      ),

      el('div', { class: 'card card-pad' },
        el('div', { class: 'group-title' }, 'Change password'),
        el('div', { class: 'field' }, el('label', {}, 'Current password'), currentPassword),
        el('div', { class: 'field' }, el('label', {}, 'New password'), newPassword,
          el('div', { class: 'help' }, 'At least 10 characters, with upper case, lower case and a number.')),
        el('div', { class: 'field' }, el('label', {}, 'Confirm new password'), confirmPassword),
        pwError,
        el('button', {
          class: 'btn btn-primary',
          onclick: async e => {
            pwError.style.display = 'none'

            if (newPassword.value !== confirmPassword.value) {
              pwError.textContent = 'The two new passwords do not match.'
              pwError.style.display = 'block'
              return
            }

            e.target.disabled = true
            try {
              await api.post('/auth/change-password', {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value,
              })
              // Changing the password revokes every session, including this one.
              toast('Password changed — signing you out', 'success')
              setToken(null)
              setTimeout(() => window.location.reload(), 1200)
            } catch (err) {
              pwError.textContent = err.details ? Object.values(err.details).join(' ') : err.message
              pwError.style.display = 'block'
              e.target.disabled = false
            }
          },
        }, 'Change password'),
        el('p', { class: 'hint', style: { marginTop: '12px' } },
          'Changing your password signs you out of every device.'),
      ),
    ),
  )
}
