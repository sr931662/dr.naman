import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A password reset in flight.
 *
 * The flow has two stages and this one document carries both, so a reset can
 * never be half-recorded in two collections:
 *
 *   1. `codeHash` holds the emailed OTP. The user proves they read the inbox.
 *   2. Verifying swaps it for `ticketHash` — a long random single-use token —
 *      and the code is cleared. The new password is then set with the ticket,
 *      never with the six digits, so the short code is only ever accepted once
 *      and only over the attempt-limited verify step.
 *
 * Both the code and the ticket are stored hashed: a database leak must not
 * hand over a working account-recovery path.
 */
const passwordResetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },

  codeHash: { type: String, select: false },
  ticketHash: { type: String, select: false },

  /** Governs whichever stage is currently live. */
  expiresAt: { type: Date, required: true },

  /** Wrong guesses. The document is spent once this hits the cap. */
  attempts: { type: Number, default: 0 },
  consumedAt: Date,

  ip: String,
  userAgent: String,
}, { timestamps: true })

// Keep spent and abandoned attempts from accumulating. The window is well past
// `expiresAt` so an expired reset still reports "expired" rather than silently
// becoming "not recognised" the moment Mongo's reaper happens to run.
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

passwordResetSchema.virtual('isExpired').get(function isExpired() {
  return this.expiresAt <= new Date()
})

export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema)
