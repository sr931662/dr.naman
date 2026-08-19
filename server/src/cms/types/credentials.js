import { defineType } from '../defineType.js'

export default defineType({
  name: 'credentials',
  label: 'Credentials Marquee',
  singular: 'Credential',
  group: 'Home Page',
  icon: '🏅',
  description: 'The scrolling ribbon of affiliations and certifications.',
  titleField: 'text',
  listColumns: ['text', 'emphasis', 'status', 'order'],
  fields: [
    { name: 'text', type: 'string', label: 'Text', required: true, listColumn: true, help: 'e.g. "Delhi".' },
    { name: 'emphasis', type: 'string', label: 'Bold part', listColumn: true, help: 'Rendered bold before the text, e.g. "MCh Urology".' },
    { name: 'url', type: 'url', label: 'Link (optional)' },
  ],
})
