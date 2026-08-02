import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * Refresh tokens are stored hashed so a database leak cannot be replayed as a
 * session. Rotation marks the old token `replacedBy`, which makes token reuse
 * detectable (see auth.service.rotate).
 */
const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
  revokedAt: Date,
  replacedBy: String,
  userAgent: String,
  ip: String,
}, { timestamps: true })

// Mongo reaps expired sessions on its own.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

refreshTokenSchema.virtual('isActive').get(function isActive() {
  return !this.revokedAt && this.expiresAt > new Date()
})

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)
