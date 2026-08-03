import { api, setToken } from '../api.js'
import { el, clear } from '../ui.js'
import { enter, leave, play, motionOff, EASE } from '../motion.js'

/**
 * The unauthenticated screen: sign in, plus the forgotten-password flow.
 *
 * Everything lives inside one card whose body is swapped between steps, so the
 * user never loses their place by being thrown to a different page — the card
 * grows or shrinks into the next step instead.
 */
export function renderLogin(onSuccess) {
  const app = document.getElementById('app')
  app.className = ''
  clear(app)

  const panel = el('div', { class: 'auth-panel' })

  const card = el('div', { class: 'login-card' },
    el('div', { class: 'boot-mark', style: { margin: '0 0 4px' } }, 'N'),
    el('h1', {}, 'Content Management'),
    el('p', { class: 'sub' }, 'Dr. Naman Aggarwal — Urology practice'),
    panel,
  )

  app.append(el('div', { class: 'login-wrap' }, card))

  /** Crossfades the body and animates the card between the two heights. */
  async function show(build, { focus = true } = {}) {
    const outgoing = panel.firstElementChild
    const from = panel.getBoundingClientRect().height

    if (outgoing) await leave(outgoing, { y: -4 })
    clear(panel)

    const next = build()
    panel.append(next)

    const to = panel.getBoundingClientRect().height
    if (!motionOff() && from && Math.abs(to - from) > 2) {
      panel.style.overflow = 'hidden'
      play(panel, { height: [`${from}px`, `${to}px`] }, { duration: 0.3, ease: EASE })
        .then(() => { panel.style.height = ''; panel.style.overflow = '' })
    }

    enter(next, { y: 10 })
    if (focus) next.querySelector('input:not([disabled])')?.focus()
  }

  const shake = () => play(card, { x: [0, -7, 6, -4, 0] }, { duration: 0.34, ease: 'easeOut' })

  // ─── Step: sign in ─────────────────────────────────────────────────────────

  function signIn(prefill = '') {
    const error = el('div', { class: 'err', style: { marginBottom: '14px', display: 'none' } })
    const email = el('input', { type: 'email', id: 'email', required: true, autocomplete: 'username', placeholder: 'you@example.com', value: prefill })
    const password = el('input', { type: 'password', id: 'password', required: true, autocomplete: 'current-password', placeholder: '••••••••' })
    const submit = el('button', { class: 'btn btn-primary btn-block', type: 'submit' }, 'Sign in')

    return el('form', {
      onsubmit: async e => {
        e.preventDefault()
        error.style.display = 'none'
        busy(submit, true, 'Signing in…')

        try {
          const res = await api.login(email.value.trim(), password.value)
          setToken(res.data.accessToken)
          await onSuccess()
          return
        } catch (err) {
          fail(error, err.message || 'Sign in failed')
          password.value = ''
          password.focus()
          shake()
        } finally {
          busy(submit, false, 'Sign in')
        }
      },
    },
      el('div', { class: 'field' }, el('label', { for: 'email' }, 'Email'), email),
      el('div', { class: 'field' },
        el('div', { class: 'label-row' },
          el('label', { for: 'password' }, 'Password'),
          el('button', {
            type: 'button',
            class: 'link-btn',
            onclick: () => show(() => askEmail(email.value.trim())),
          }, 'Forgot password?'),
        ),
        password,
      ),
      error,
      submit,
    )
  }

  // ─── Step: which account ───────────────────────────────────────────────────

  function askEmail(prefill = '') {
    const error = el('div', { class: 'err', style: { marginBottom: '14px', display: 'none' } })
    const email = el('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'you@example.com', value: prefill })
    const submit = el('button', { class: 'btn btn-primary btn-block', type: 'submit' }, 'Email me a code')

    return el('form', {
      onsubmit: async e => {
        e.preventDefault()
        error.style.display = 'none'
        busy(submit, true, 'Sending…')

        const address = email.value.trim()
        try {
          const res = await api.forgotPassword(address)
          show(() => enterCode(address, res.data))
        } catch (err) {
          fail(error, err.message || 'Could not send the code')
          shake()
        } finally {
          busy(submit, false, 'Email me a code')
        }
      },
    },
      stepHead('Reset your password',
        'Enter the email you sign in with and we will send a six-digit passcode.'),
      el('div', { class: 'field' }, el('label', {}, 'Email'), email),
      error,
      submit,
      backLink('Back to sign in', () => show(() => signIn(email.value.trim()))),
    )
  }

  // ─── Step: the passcode ────────────────────────────────────────────────────

  function enterCode(address, policy = {}) {
    const error = el('div', { class: 'err', style: { margin: '4px 0 14px', display: 'none' } })
    const submit = el('button', { class: 'btn btn-primary btn-block', type: 'submit' }, 'Verify code')

    const form = el('form', {
      onsubmit: async e => {
        e.preventDefault()
        error.style.display = 'none'

        const code = otp.value()
        if (code.length !== 6) return fail(error, 'Enter all six digits')

        busy(submit, true, 'Checking…')
        try {
          const res = await api.verifyResetCode(address, code)
          show(() => choosePassword(address, res.data.ticket))
        } catch (err) {
          fail(error, err.message || 'That code was not accepted')
          otp.reset()
          shake()
        } finally {
          busy(submit, false, 'Verify code')
        }
      },
    })

    // Six correct digits is the whole input — waiting for a button press after
    // the last one is a keystroke nobody needs.
    const otp = otpInput({ onComplete: () => form.requestSubmit() })

    const resend = resendButton(address, error)

    form.append(
      stepHead('Check your email',
        `We sent a six-digit code to ${address}. It expires in ${policy.expiresInMinutes || 10} minutes.`),
      otp.node,
      error,
      submit,
      resend.node,
      backLink('Use a different email', () => show(() => askEmail(address))),
    )

    // Only ever present on a dev box with no SMTP configured.
    if (policy.devCode) {
      form.insertBefore(
        el('div', { class: 'help', style: { margin: '0 0 10px' } },
          'Development mode — SMTP is off, so the code is ', el('b', {}, policy.devCode)),
        otp.node,
      )
    }

    resend.start(policy.resendSeconds || 60)
    return form
  }

  /** "Resend", gated by the same cooldown the server's limiter enforces. */
  function resendButton(address, error) {
    const button = el('button', { type: 'button', class: 'link-btn', disabled: true })
    const node = el('p', { class: 'hint auth-resend' }, 'Did not get it? ', button)
    let timer = null

    function start(seconds) {
      clearInterval(timer)
      let left = seconds
      const tick = () => {
        button.disabled = left > 0
        button.textContent = left > 0 ? `Resend in ${left}s` : 'Send a new code'
        if (left-- <= 0) clearInterval(timer)
      }
      tick()
      timer = setInterval(tick, 1000)
    }

    button.addEventListener('click', async () => {
      button.disabled = true
      error.style.display = 'none'
      try {
        const res = await api.forgotPassword(address)
        start(res.data.resendSeconds || 60)
      } catch (err) {
        fail(error, err.message || 'Could not resend the code')
        button.disabled = false
        button.textContent = 'Send a new code'
      }
    })

    return { node, start }
  }

  // ─── Step: the new password ────────────────────────────────────────────────

  function choosePassword(address, ticket) {
    const error = el('div', { class: 'err', style: { marginBottom: '14px', display: 'none' } })
    const next = el('input', { type: 'password', required: true, autocomplete: 'new-password' })
    const confirm = el('input', { type: 'password', required: true, autocomplete: 'new-password' })
    const submit = el('button', { class: 'btn btn-primary btn-block', type: 'submit' }, 'Set new password')

    return el('form', {
      onsubmit: async e => {
        e.preventDefault()
        error.style.display = 'none'

        if (next.value !== confirm.value) {
          fail(error, 'The two passwords do not match.')
          return shake()
        }

        busy(submit, true, 'Saving…')
        try {
          await api.resetPassword(ticket, next.value)
          show(() => done(address))
        } catch (err) {
          const detail = err.details ? Object.values(err.details).join(' ') : null
          fail(error, detail || err.message || 'Could not set that password')
          shake()
        } finally {
          busy(submit, false, 'Set new password')
        }
      },
    },
      stepHead('Choose a new password', `For ${address}.`),
      el('div', { class: 'field' },
        el('label', {}, 'New password'), next,
        el('div', { class: 'help' }, 'At least 10 characters, with upper case, lower case and a number.'),
      ),
      el('div', { class: 'field' }, el('label', {}, 'Confirm new password'), confirm),
      error,
      submit,
    )
  }

  function done(address) {
    return el('div', {},
      el('div', { class: 'auth-done' }, '✓'),
      stepHead('Password updated',
        'Any other device signed into this account has been signed out.'),
      el('button', {
        class: 'btn btn-primary btn-block',
        onclick: () => show(() => signIn(address)),
      }, 'Sign in'),
    )
  }

  show(() => signIn(), { focus: false })
  panel.querySelector('input')?.focus()
}

// ─── Small shared pieces ─────────────────────────────────────────────────────

function stepHead(title, description) {
  return el('div', { class: 'auth-step-head' },
    el('h2', {}, title),
    description && el('p', {}, description),
  )
}

function backLink(label, onclick) {
  return el('p', { class: 'hint auth-back' },
    el('button', { type: 'button', class: 'link-btn', onclick }, label))
}

function fail(box, message) {
  box.textContent = message
  box.style.display = 'block'
}

function busy(button, on, label) {
  button.disabled = on
  clear(button)
  if (on) button.append(el('span', { class: 'spinner' }), ` ${label}`)
  else button.append(label)
}

/**
 * A six-box passcode field.
 *
 * One box per digit rather than a single text input, because it makes the
 * expected length obvious and gives an unambiguous target on a phone. Pasting
 * the whole code into any box still fills the row — people paste from their
 * mail client far more often than they retype.
 */
function otpInput({ length = 6, onComplete } = {}) {
  const boxes = []

  const commit = () => {
    if (boxes.every(b => b.value)) onComplete?.()
  }

  for (let i = 0; i < length; i++) {
    const box = el('input', {
      type: 'text',
      inputmode: 'numeric',
      autocomplete: i === 0 ? 'one-time-code' : 'off',
      maxlength: 1,
      class: 'otp-box',
      'aria-label': `Digit ${i + 1}`,

      oninput: e => {
        // A phone keyboard can deliver several characters at once.
        const digits = e.target.value.replace(/\D/g, '')
        if (!digits) return void (e.target.value = '')

        e.target.value = digits[0]
        let cursor = i
        for (let k = 1; k < digits.length && cursor + 1 < length; k++) {
          boxes[++cursor].value = digits[k]
        }
        boxes[Math.min(cursor + 1, length - 1)].focus()
        commit()
      },

      onkeydown: e => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
          e.preventDefault()
          boxes[i - 1].value = ''
          boxes[i - 1].focus()
        }
        if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); boxes[i - 1].focus() }
        if (e.key === 'ArrowRight' && i < length - 1) { e.preventDefault(); boxes[i + 1].focus() }
      },

      onpaste: e => {
        e.preventDefault()
        const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length)
        if (!digits) return
        digits.split('').forEach((d, k) => { boxes[k].value = d })
        boxes[Math.min(digits.length, length - 1)].focus()
        commit()
      },

      onfocus: e => e.target.select(),
    })
    boxes.push(box)
  }

  return {
    node: el('div', { class: 'otp-row' }, ...boxes),
    value: () => boxes.map(b => b.value).join(''),
    reset: () => {
      boxes.forEach(b => { b.value = '' })
      boxes[0].focus()
    },
  }
}
