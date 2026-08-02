import { api, setToken } from '../api.js'
import { el, clear } from '../ui.js'

export function renderLogin(onSuccess) {
  const app = document.getElementById('app')
  app.className = ''
  clear(app)

  const error = el('div', { class: 'err', style: { marginBottom: '14px', display: 'none' } })
  const emailInput = el('input', { type: 'email', id: 'email', required: true, autocomplete: 'username', placeholder: 'you@example.com' })
  const passwordInput = el('input', { type: 'password', id: 'password', required: true, autocomplete: 'current-password', placeholder: '••••••••' })
  const submit = el('button', { class: 'btn btn-primary', type: 'submit', style: { width: '100%', justifyContent: 'center' } }, 'Sign in')

  const form = el('form', {
    onsubmit: async e => {
      e.preventDefault()
      error.style.display = 'none'
      submit.disabled = true
      clear(submit)
      submit.append(el('span', { class: 'spinner' }), ' Signing in…')

      try {
        const res = await api.login(emailInput.value.trim(), passwordInput.value)
        setToken(res.data.accessToken)
        await onSuccess()
      } catch (err) {
        error.textContent = err.message || 'Sign in failed'
        error.style.display = 'block'
        passwordInput.value = ''
        passwordInput.focus()
      } finally {
        submit.disabled = false
        clear(submit)
        submit.append('Sign in')
      }
    },
  },
    el('div', { class: 'field' }, el('label', { for: 'email' }, 'Email'), emailInput),
    el('div', { class: 'field' }, el('label', { for: 'password' }, 'Password'), passwordInput),
    error,
    submit,
  )

  app.append(el('div', { class: 'login-wrap' },
    el('div', { class: 'login-card' },
      el('div', { class: 'boot-mark', style: { margin: '0 0 4px' } }, 'N'),
      el('h1', {}, 'Content Management'),
      el('p', { class: 'sub' }, 'Dr. Naman Aggarwal — Urology practice'),
      form,
    ),
  ))

  emailInput.focus()
}
