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
 */
export async function sendMail({ to, subject, text, html, replyTo }) {
  const tx = getTransporter()
  if (!tx) {
    logger.info(`[mail disabled] would send "${subject}" to ${to}`)
    return { skipped: true }
  }

  try {
    const info = await tx.sendMail({ from: env.mail.from, to, subject, text, html, replyTo })
    logger.info(`Mail sent: ${subject} → ${to}`)
    return { messageId: info.messageId }
  } catch (err) {
    // Never let a mail outage break the patient-facing form submission.
    logger.error('Mail send failed:', err.message)
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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}
