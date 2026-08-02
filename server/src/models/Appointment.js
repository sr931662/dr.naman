import mongoose from 'mongoose'

const { Schema } = mongoose

export const APPOINTMENT_STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'cancelled', 'spam']

/**
 * A consultation request from the contact form.
 *
 * `message` may contain symptom descriptions, so this collection is patient
 * data: it is never exposed on any public route, and the list endpoint requires
 * an authenticated CMS user.
 */
const appointmentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  message: { type: String, required: true },
  preferredTime: { type: String, default: '' },
  location: { type: Schema.Types.ObjectId, ref: 'Locations' },

  status: { type: String, enum: APPOINTMENT_STATUSES, default: 'new', index: true },
  notes: [{
    _id: false,
    text: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    at: { type: Date, default: Date.now },
  }],
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  contactedAt: Date,
  scheduledFor: Date,

  // Request provenance, useful for spam triage and attribution.
  source: { type: String, default: 'website' },
  referrer: String,
  ip: String,
  userAgent: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
})

appointmentSchema.index({ createdAt: -1 })
appointmentSchema.index({ name: 'text', email: 'text', phone: 'text', message: 'text' })

export const Appointment = mongoose.model('Appointment', appointmentSchema)
