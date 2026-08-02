import { defineType } from '../defineType.js'

export default defineType({
  name: 'philosophy',
  label: 'Philosophy Cards',
  singular: 'Card',
  group: 'Home Page',
  icon: '🧠',
  description: 'The practice-philosophy cards.',
  listColumns: ['title', 'status', 'order'],
  searchFields: ['title', 'body'],
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true },
    { name: 'body', type: 'text', label: 'Body', required: true },
    { name: 'kicker', type: 'string', label: 'Kicker', help: 'Small label above the title.' },
    { name: 'icon', type: 'svg', label: 'Icon (SVG)' },
  ],
})
