import { defineType } from '../defineType.js'

/** The training / career timeline on the home page. */
export default defineType({
  name: 'journey',
  label: 'Career Timeline',
  singular: 'Milestone',
  group: 'Home Page',
  icon: '🧭',
  description: 'Training, fellowships and appointments shown on the vertical timeline.',
  listColumns: ['title', 'year', 'status', 'order'],
  searchFields: ['title', 'desc', 'year'],
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true },
    { name: 'year', type: 'string', label: 'Label', required: true, listColumn: true, help: 'e.g. "2022 · Fellowship".' },
    { name: 'desc', type: 'text', label: 'Description', required: true },
    {
      name: 'side',
      type: 'select',
      label: 'Side',
      default: 'left',
      options: [
        { value: 'left', label: 'Left of the spine' },
        { value: 'right', label: 'Right of the spine' },
      ],
      help: 'Alternate these for the zig-zag layout.',
    },
    { name: 'logo', type: 'image', label: 'Institution logo' },
  ],
})
