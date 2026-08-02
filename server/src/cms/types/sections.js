import { defineType } from '../defineType.js'

/**
 * Editable copy for every section header on the site.
 *
 * Each record is looked up by a stable `key` the component passes in, so the
 * eyebrow / heading / lead of any section can be reworded without a code change.
 */
export default defineType({
  name: 'sections',
  label: 'Section Copy',
  singular: 'Section',
  group: 'Site',
  icon: '🔤',
  description: 'Headings and intro copy for each section of the site, looked up by key.',
  titleField: 'heading',
  listColumns: ['key', 'heading', 'status', 'order'],
  searchFields: ['key', 'heading', 'lead'],
  fields: [
    {
      name: 'key',
      type: 'slug',
      label: 'Section key',
      required: true,
      unique: true,
      listColumn: true,
      help: 'The stable identifier the component requests, e.g. "home-testimonials". Do not rename once live.',
    },
    { name: 'eyebrow', type: 'string', label: 'Eyebrow', help: 'Small uppercase label above the heading.' },
    { name: 'heading', type: 'string', label: 'Heading', required: true, listColumn: true, help: 'Wrap a word in <em> to give it the accent style.' },
    { name: 'lead', type: 'text', label: 'Lead paragraph' },
    { name: 'ctaLabel', type: 'string', label: 'CTA label' },
    { name: 'ctaUrl', type: 'url', label: 'CTA URL' },
  ],
})
