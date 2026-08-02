import mongoose from 'mongoose'
import crypto from 'node:crypto'

const { Schema } = mongoose

const subscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  name: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'subscribed', 'unsubscribed'],
    default: 'subscribed',
    index: true,
  },
  /** Opaque token used by one-click unsubscribe links. */
  token: { type: String, default: () => crypto.randomBytes(24).toString('hex'), index: true },
  source: { type: String, default: 'website' },
  confirmedAt: Date,
  unsubscribedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
})

export const Subscriber = mongoose.model('Subscriber', subscriberSchema)
