import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT_DIR = path.resolve(__dirname, '../..')

// Load server/.env explicitly rather than relying on the working directory:
// `npm start` from the repo root would otherwise look for a .env that isn't
// there and start with development defaults. Platform-provided variables
// (Cloud Run, etc.) already in the environment always win.
dotenv.config({ path: path.join(ROOT_DIR, '.env') })

const bool = (v, fallback = false) => {
  if (v === undefined || v === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase())
}
const num = (v, fallback) => (v === undefined || v === '' ? fallback : Number(v))
const list = (v, fallback = []) =>
  v ? v.split(',').map(s => s.trim()).filter(Boolean) : fallback

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num(process.env.PORT, 5000),
  corsOrigins: list(process.env.CORS_ORIGINS, ['http://localhost:5173']),

  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dr-naman',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  },

  cookie: {
    secure: bool(process.env.COOKIE_SECURE, false),
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    name: 'drn_refresh',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@drnamanaggarwal.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe!2024',
    name: process.env.ADMIN_NAME || 'Site Administrator',
  },

  uploads: {
    dir: path.resolve(ROOT_DIR, process.env.UPLOAD_DIR || 'uploads'),
    maxBytes: num(process.env.MAX_UPLOAD_MB, 8) * 1024 * 1024,
    publicUrl: process.env.PUBLIC_URL || '',
  },

  mail: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    // Falls back to the authenticated mailbox before the vanity address:
    // Gmail refuses to send as an address the account does not own, so a
    // MAIL_FROM left at the default would bounce every message.
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@drnamanaggarwal.com',
    notify: process.env.NOTIFY_EMAIL || '',
    get enabled() {
      return Boolean(this.host)
    },
  },
}

/**
 * Fails fast in production if secrets were left at their development defaults —
 * a silently-insecure deploy is far worse than a loud startup crash.
 */
export function assertProductionConfig() {
  if (!env.isProd) return
  const problems = []
  if (env.jwt.accessSecret === 'dev-access-secret') problems.push('JWT_ACCESS_SECRET')
  if (env.jwt.refreshSecret === 'dev-refresh-secret') problems.push('JWT_REFRESH_SECRET')
  if (env.jwt.accessSecret === env.jwt.refreshSecret) problems.push('JWT secrets must differ')
  if (problems.length) {
    throw new Error(`Insecure production config — set: ${problems.join(', ')}`)
  }
}
