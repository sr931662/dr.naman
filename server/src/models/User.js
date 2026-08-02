import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

export const ROLES = ['admin', 'editor', 'author', 'viewer']

/**
 * Capability matrix. Routes ask `can(user, 'content.publish')` rather than
 * checking role strings, so permissions can be retuned in one place.
 */
export const PERMISSIONS = {
  admin: ['*'],
  editor: [
    'content.read', 'content.write', 'content.publish', 'content.delete',
    'media.read', 'media.write', 'media.delete',
    'appointments.read', 'appointments.write',
    'settings.write', 'analytics.read', 'audit.read',
  ],
  author: [
    'content.read', 'content.write',
    'media.read', 'media.write',
    'appointments.read',
  ],
  viewer: ['content.read', 'media.read', 'appointments.read', 'analytics.read'],
}

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'editor', index: true },
  avatar: { type: String, default: '' },
  active: { type: Boolean, default: true },
  lastLoginAt: Date,
  // Incremented on password change / forced logout, invalidating live refresh tokens.
  tokenVersion: { type: Number, default: 0 },
  failedLogins: { type: Number, default: 0 },
  lockedUntil: Date,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => { delete ret.passwordHash; return ret },
  },
})

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 12)
  this.tokenVersion += 1
}

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

userSchema.virtual('isLocked').get(function isLocked() {
  return Boolean(this.lockedUntil && this.lockedUntil > new Date())
})

export function can(user, permission) {
  if (!user) return false
  const granted = PERMISSIONS[user.role] || []
  return granted.includes('*') || granted.includes(permission)
}

export const User = mongoose.model('User', userSchema)
