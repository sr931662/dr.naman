import mongoose from 'mongoose'

const { Schema } = mongoose

/** Who changed what, and when — clinical content needs a paper trail. */
const auditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  userName: String,
  action: { type: String, required: true, index: true }, // create | update | delete | publish | login …
  resource: { type: String, required: true, index: true }, // content type, 'media', 'auth' …
  resourceId: { type: String, index: true },
  label: String,
  changes: Schema.Types.Mixed,
  ip: String,
  userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false } })

auditLogSchema.index({ createdAt: -1 })
// Keep six months of history without manual pruning.
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
