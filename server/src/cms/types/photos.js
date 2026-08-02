import { defineType } from '../defineType.js'

export default defineType({
  name: 'photos',
  label: 'Photo Gallery',
  singular: 'Photo',
  group: 'Home Page',
  icon: '📸',
  description: 'Clinic and practice photos in "The doctor & the clinic" grid.',
  titleField: 'label',
  listColumns: ['label', 'sub', 'status', 'order'],
  searchFields: ['label', 'sub'],
  fields: [
    { name: 'label', type: 'string', label: 'Caption', required: true, listColumn: true },
    { name: 'sub', type: 'string', label: 'Sub-caption', listColumn: true },
    { name: 'image', type: 'image', label: 'Photo', required: true },
    { name: 'featured', type: 'boolean', label: 'Large / featured cell', help: 'Renders in the wide portrait slot.' },
  ],
})
