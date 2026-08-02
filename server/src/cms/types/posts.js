import { defineType } from '../defineType.js'
import { seoField } from './_shared.js'

/** Blog / patient-education articles. */
export default defineType({
  name: 'posts',
  label: 'Blog Posts',
  singular: 'Post',
  group: 'Editorial',
  icon: '✍️',
  description: 'Articles shown on /blog and /blog/:slug.',
  orderable: false,
  defaultSort: '-publishedAt',
  listColumns: ['title', 'category', 'status', 'publishedAt'],
  searchFields: ['title', 'excerpt', 'body'],
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true },
    { name: 'slug', type: 'slug', label: 'URL slug', required: true, unique: true },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      listColumn: true,
      default: 'Patient Education',
      options: [
        'Patient Education',
        'Surgical Advances',
        'Andrology',
        'Urology',
        'Transplant',
        'Uro-Oncology',
        'Research',
      ],
    },
    { name: 'excerpt', type: 'text', label: 'Excerpt', required: true, maxLength: 320, help: 'Shown on cards and used as the meta description fallback.' },
    { name: 'coverImage', type: 'image', label: 'Cover image' },
    { name: 'body', type: 'richtext', label: 'Article body', group: 'Content' },
    {
      name: 'paragraphs',
      type: 'array',
      label: 'Paragraphs (plain)',
      group: 'Content',
      help: 'Alternative to the rich-text body — one paragraph per item. Used when the body is empty.',
      of: { type: 'text', label: 'Paragraph' },
    },
    { name: 'readTime', type: 'string', label: 'Read time', help: 'e.g. "6 min read". Auto-calculated on save when left blank.' },
    { name: 'featured', type: 'boolean', label: 'Feature on home page' },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      group: 'Meta',
      of: { type: 'string', label: 'Tag' },
    },
    {
      name: 'relatedTreatments',
      type: 'array',
      label: 'Related treatments',
      group: 'Meta',
      of: { type: 'reference', label: 'Treatment', refModel: 'Treatments' },
    },
    { name: 'author', type: 'string', label: 'Author', default: 'Dr. Naman Aggarwal', group: 'Meta' },
    { name: 'medicallyReviewed', type: 'boolean', label: 'Medically reviewed', default: true, group: 'Meta' },
    seoField(),
  ],

  hooks: {
    /** Derive a read time from the body when the editor hasn't set one. */
    beforeSave(doc) {
      if (!doc.readTime) {
        const text = [doc.body || '', ...(doc.paragraphs || [])].join(' ')
        const words = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
        if (words) doc.readTime = `${Math.max(1, Math.round(words / 200))} min read`
      }
      return doc
    },
  },
})
