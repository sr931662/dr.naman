import { defineType } from '../defineType.js'

export default defineType({
  name: 'hero',
  kind: 'single',
  label: 'Home Hero',
  singular: 'Home Hero',
  group: 'Home Page',
  icon: '🌅',
  description: 'The opening panel of the home page.',
  fields: [
    {
      name: 'headlineWords',
      type: 'array',
      label: 'Headline words',
      required: true,
      help: 'Each word animates in separately — one word (or short phrase) per item.',
      of: { type: 'string', label: 'Word' },
    },
    { name: 'eyebrow', type: 'string', label: 'Eyebrow' },
    { name: 'subheading', type: 'text', label: 'Sub-heading' },
    { name: 'image', type: 'image', label: 'Hero image' },
    {
      name: 'ctas',
      type: 'array',
      label: 'Call-to-action buttons',
      of: {
        type: 'object',
        fields: [
          { name: 'label', type: 'string', label: 'Label', required: true },
          { name: 'url', type: 'url', label: 'URL', required: true },
          {
            name: 'variant',
            type: 'select',
            label: 'Style',
            default: 'primary',
            options: [
              { value: 'primary', label: 'Primary (filled)' },
              { value: 'ghost', label: 'Ghost (outline)' },
            ],
          },
        ],
      },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Stat strip',
      help: 'Small proof points under the hero, e.g. "11 yrs · Experience".',
      of: {
        type: 'object',
        fields: [
          { name: 'value', type: 'string', label: 'Value', required: true },
          { name: 'label', type: 'string', label: 'Label', required: true },
        ],
      },
    },
  ],
})
