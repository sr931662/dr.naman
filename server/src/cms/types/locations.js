import { defineType } from '../defineType.js'

/** Consulting locations, OPD schedules and fees — powers the Contact page. */
export default defineType({
  name: 'locations',
  label: 'Clinic Locations',
  singular: 'Location',
  group: 'Practice',
  icon: '📍',
  description: 'Hospitals and clinics with their OPD hours, fees and map embeds.',
  listColumns: ['name', 'kind', 'status', 'order'],
  searchFields: ['name', 'addressLine', 'city'],
  fields: [
    { name: 'name', type: 'string', label: 'Name', required: true, listColumn: true },
    {
      name: 'kind',
      type: 'select',
      label: 'Type',
      listColumn: true,
      default: 'secondary',
      options: [
        { value: 'primary', label: 'Primary hospital' },
        { value: 'secondary', label: 'Secondary clinic' },
        { value: 'oncall', label: 'On-call basis' },
      ],
    },
    { name: 'image', type: 'image', label: 'Photo', help: 'Shown on the Contact page location card.' },
    {
      name: 'badgeLabel',
      type: 'string',
      label: 'Card badge',
      help: 'Small label shown above the name, e.g. "Dr. Aggarwal\'s Clinic", "His Own Hospital", "Also Consults Here". Leave blank to use a default based on Type.',
    },
    { name: 'addressLine', type: 'text', label: 'Address', group: 'Address' },
    { name: 'landmark', type: 'string', label: 'Landmark', group: 'Address' },
    { name: 'city', type: 'string', label: 'City', group: 'Address' },
    { name: 'pincode', type: 'string', label: 'PIN code', group: 'Address' },
    { name: 'phone', type: 'phone', label: 'Phone', group: 'Contact' },
    { name: 'mapEmbedUrl', type: 'url', label: 'Google Maps embed URL', group: 'Map', help: 'The src of the Maps <iframe>.' },
    { name: 'mapLink', type: 'url', label: 'Google Maps link', group: 'Map' },

    {
      name: 'schedule',
      type: 'array',
      label: 'OPD schedule',
      group: 'Schedule',
      of: {
        type: 'object',
        fields: [
          { name: 'days', type: 'string', label: 'Days', required: true, help: 'e.g. "Tue & Sat".' },
          { name: 'hours', type: 'string', label: 'Hours', required: true, help: 'e.g. "9:00 AM – 3:00 PM".' },
          { name: 'note', type: 'string', label: 'Note' },
        ],
      },
    },
    { name: 'consultationFee', type: 'number', label: 'Consultation fee (₹)', group: 'Schedule', min: 0 },
    { name: 'teleconsultation', type: 'boolean', label: 'Teleconsultation available', group: 'Schedule' },

    {
      name: 'directions',
      type: 'array',
      label: 'How to reach',
      group: 'Directions',
      of: {
        type: 'object',
        fields: [
          { name: 'mode', type: 'string', label: 'Mode', required: true, help: 'e.g. "By Metro".' },
          { name: 'detail', type: 'string', label: 'Detail', required: true },
        ],
      },
    },
  ],
})
