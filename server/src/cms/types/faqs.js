import { defineType } from '../defineType.js'

export default defineType({
  name: 'faqs',
  label: 'FAQs',
  singular: 'FAQ',
  group: 'Clinical',
  icon: '❓',
  description: 'The site-wide FAQ accordion. Treatment-specific FAQs live on each treatment record.',
  titleField: 'q',
  listColumns: ['q', 'category', 'status', 'order'],
  searchFields: ['q', 'a'],
  fields: [
    { name: 'q', type: 'string', label: 'Question', required: true, listColumn: true },
    { name: 'a', type: 'text', label: 'Answer', required: true },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      listColumn: true,
      default: 'General',
      options: ['General', 'Appointments', 'Surgery', 'Recovery', 'Fertility', 'Costs & Insurance'],
    },
    { name: 'showOnHome', type: 'boolean', label: 'Show in the home FAQ section', default: true },
  ],
})
