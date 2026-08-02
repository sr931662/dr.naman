import mongoose from 'mongoose'

const { Schema } = mongoose

const mediaSchema = new Schema({
  filename: { type: String, required: true },
  originalName: String,
  mimeType: { type: String, required: true, index: true },
  size: { type: Number, required: true },
  width: Number,
  height: Number,
  url: { type: String, required: true },
  thumbnailUrl: String,
  /** Path on disk relative to the upload dir — used for deletion. */
  storagePath: { type: String, required: true },
  alt: { type: String, default: '' },
  caption: { type: String, default: '' },
  folder: { type: String, default: 'general', index: true },
  tags: { type: [String], default: [], index: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
})

mediaSchema.index({ originalName: 'text', alt: 'text', caption: 'text' })

export const Media = mongoose.model('Media', mediaSchema)
