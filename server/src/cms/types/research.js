import { defineType } from '../defineType.js'

export default defineType({
  name: 'research',
  label: 'Research & Talks',
  singular: 'Talk',
  group: 'Home Page',
  icon: '🎤',
  description: 'Conference talks, publications and academic contributions.',
  listColumns: ['title', 'meta', 'status', 'order'],
  searchFields: ['title', 'meta', 'summary'],
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true },
    {
      name: 'meta',
      type: 'select',
      label: 'Scope',
      listColumn: true,
      default: 'National',
      options: ['International', 'National', 'Regional', 'Ongoing'],
    },
    {
      name: 'kind',
      type: 'select',
      label: 'Type',
      default: 'talk',
      options: [
        { value: 'talk', label: 'Talk / lecture' },
        { value: 'publication', label: 'Publication' },
        { value: 'fellowship', label: 'Fellowship' },
        { value: 'award', label: 'Award' },
      ],
    },
    { name: 'summary', type: 'text', label: 'Summary' },
    { name: 'venue', type: 'string', label: 'Conference / journal' },
    { name: 'year', type: 'number', label: 'Year', integer: true, min: 1980, max: 2100 },
    { name: 'url', type: 'url', label: 'Link' },
  ],
})
