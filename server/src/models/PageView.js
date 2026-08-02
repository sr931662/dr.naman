import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Lightweight, cookieless traffic counters — enough to answer "which treatment
 * pages do patients actually read?" without shipping a third-party tracker.
 * Visitors are counted by a daily-rotating salted hash, never by a stable id.
 */
const pageViewSchema = new Schema({
  path: { type: String, required: true, index: true },
  type: { type: String, default: 'page' }, // page | event
  event: String,
  referrer: String,
  day: { type: String, required: true, index: true }, // YYYY-MM-DD
  visitorHash: { type: String, index: true },
  country: String,
  device: String,
}, { timestamps: { createdAt: true, updatedAt: false } })

pageViewSchema.index({ day: 1, path: 1 })
// Retain 13 months so year-on-year comparisons are possible, then auto-expire.
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400 })

export const PageView = mongoose.model('PageView', pageViewSchema)
