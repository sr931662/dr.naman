import { defineType } from '../defineType.js'

export default defineType({
  name: 'testimonials',
  label: 'Testimonials',
  singular: 'Testimonial',
  group: 'Home Page',
  icon: '💬',
  description: 'Patient voices carousel. Only publish with documented consent.',
  listColumns: ['name', 'condition', 'status', 'order'],
  searchFields: ['name', 'quote', 'condition'],
  fields: [
    { name: 'quote', type: 'text', label: 'Quote', required: true, maxLength: 900 },
    { name: 'name', type: 'string', label: 'Patient name', required: true, listColumn: true },
    { name: 'initials', type: 'string', label: 'Initials', maxLength: 3, help: 'Shown in the avatar circle. Derived from the name when blank.' },
    { name: 'location', type: 'string', label: 'Location', help: 'e.g. "Delhi NCR".' },
    { name: 'condition', type: 'string', label: 'Condition / procedure', listColumn: true },
    { name: 'stars', type: 'number', label: 'Rating', min: 1, max: 5, integer: true, default: 5 },
    { name: 'photo', type: 'image', label: 'Photo (optional)' },
    { name: 'treatedOn', type: 'date', label: 'Treatment date', group: 'Meta' },
    {
      name: 'consentOnRecord',
      type: 'boolean',
      label: 'Written consent on record',
      group: 'Meta',
      help: 'Confirm the patient has consented to their words being published before setting this live.',
    },
  ],

  hooks: {
    beforeSave(doc) {
      if (!doc.initials && doc.name) {
        doc.initials = doc.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map(w => w[0].toUpperCase())
          .join('')
      }
      return doc
    },
  },
})
