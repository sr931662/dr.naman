/**
 * Vercel serverless entry point for the Express backend.
 *
 * Vercel invokes this handler for every request that vercel.json routes here
 * (/api/*, /admin/*, /uploads/*). The Express app is built once per warm
 * instance and reused; only the database connection needs care, because a cold
 * start would otherwise open a new pool on every invocation.
 */
import mongoose from 'mongoose'
import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/config/db.js'

// Built once per instance, reused across warm invocations.
const app = createApp()

let connecting = null

async function ensureDb() {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) return
  if (!connecting) {
    connecting = connectDB().catch(err => {
      // Clear the memo so the next invocation can retry rather than being
      // stuck with a permanently rejected promise.
      connecting = null
      throw err
    })
  }
  await connecting
}

export default async function handler(req, res) {
  try {
    await ensureDb()
  } catch (err) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({
      success: false,
      error: { code: 'DB_UNAVAILABLE', message: 'Database is not reachable.' },
    }))
  }

  return app(req, res)
}
