import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

let transporter = null

function getTransporter() {
  if (!env.mail.enabled) return null
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  })
  return transporter
}

/**
 * Sends an email if SMTP is configured; otherwise logs and resolves.
 * Callers never need to branch on whether mail is set up.
 *
 * @param {object}  message
 * @param {boolean} [message.required]  Throw instead of swallowing a failure.
 *   Appointment alerts are best-effort — a mail outage must not break a
 *   patient's form submission. A one-time passcode is the opposite: silently
 *   "succeeding" leaves someone waiting forever for a code that never left.
 */
export async function sendMail({ to, subject, text, html, replyTo, required = false }) {
  const tx = getTransporter()
  if (!tx) {
    if (required) throw new Error('SMTP is not configured on this server')
    logger.info(`[mail disabled] would send "${subject}" to ${to}`)
    return { skipped: true }
  }

  try {
    const info = await tx.sendMail({ from: env.mail.from, to, subject, text, html, replyTo })
    logger.info(`Mail sent: ${subject} → ${to}`)
    return { messageId: info.messageId }
  } catch (err) {
    logger.error('Mail send failed:', err.message)
    if (required) throw err
    return { error: err.message }
  }
}

export function appointmentNotification(appointment) {
  const lines = [
    `Name:     ${appointment.name}`,
    `Phone:    ${appointment.phone}`,
    appointment.email ? `Email:    ${appointment.email}` : null,
    appointment.preferredTime ? `Preferred: ${appointment.preferredTime}` : null,
    '',
    'Message:',
    appointment.message,
    '',
    `Received: ${new Date(appointment.createdAt || Date.now()).toLocaleString('en-IN')}`,
  ].filter(Boolean)

  return {
    to: env.mail.notify,
    replyTo: appointment.email || undefined,
    subject: `New consultation request — ${appointment.name}`,
    text: lines.join('\n'),
    html: `<h2>New consultation request</h2><pre style="font-family:ui-monospace,monospace;font-size:14px">${escapeHtml(lines.join('\n'))}</pre>`,
  }
}

export function appointmentAcknowledgement(appointment, doctorName = 'Dr. Naman Aggarwal') {
  const text = [
    `Dear ${appointment.name},`,
    '',
    `Thank you for reaching out. Your consultation request has been received and ${doctorName}'s team will contact you within 24 hours to confirm an appointment.`,
    '',
    'If your symptoms are severe or worsening — particularly severe pain, fever with urinary symptoms, inability to pass urine, or sudden testicular pain — please seek emergency care rather than waiting for this reply.',
    '',
    'Warm regards,',
    `${doctorName}'s clinic`,
  ].join('\n')

  return {
    to: appointment.email,
    subject: 'We have received your consultation request',
    text,
    html: text.split('\n').map(l => (l ? `<p>${escapeHtml(l)}</p>` : '')).join(''),
  }
}

/**
 * The password-reset passcode.
 *
 * Deliberately plain: no tracking pixels, no link to click. A reset mail that
 * looks like the phishing it is trying to protect against teaches staff
 * exactly the wrong reflex.
 */
export function passwordResetOtp({ name, email, code, minutes }) {
  const text = [
    `Hello ${name || 'there'},`,
    '',
    `Your passcode for resetting the Dr. Naman Aggarwal CMS password is:`,
    '',
    code,
    '',
    `It expires in ${minutes} minutes and can be used once.`,
    '',
    'Type it into the window you already have open. Nobody from the clinic will ever ask you for this code — if you did not request a reset, ignore this email and your password stays as it is.',
  ].join('\n')

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif;color:#16141a;line-height:1.6">
      <p>Hello ${escapeHtml(name || 'there')},</p>
      <p>Your passcode for resetting the Dr. Naman Aggarwal CMS password is:</p>
      <p style="margin:24px 0">
        <span style="display:inline-block;padding:14px 22px;background:#fbe9ec;color:#b3122a;
                     border-radius:10px;font:600 30px/1 ui-monospace,'SF Mono',Menlo,monospace;
                     letter-spacing:.32em">${escapeHtml(code)}</span>
      </p>
      <p>It expires in ${minutes} minutes and can be used once.</p>
      <p style="color:#7d7887;font-size:14px">
        Type it into the window you already have open. Nobody from the clinic will ever ask you
        for this code — if you did not request a reset, ignore this email and your password
        stays as it is.
      </p>
    </div>`

  return { to: email, subject: `${code} is your CMS password reset code`, text, html, required: true }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}
