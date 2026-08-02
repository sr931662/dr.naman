import { defineType } from '../defineType.js'

const linkItem = {
  type: 'object',
  fields: [
    { name: 'label', type: 'string', label: 'Label', required: true },
    { name: 'url', type: 'url', label: 'URL', required: true, help: 'Use /about for pages, #journey for on-page anchors.' },
    { name: 'external', type: 'boolean', label: 'Opens in a new tab' },
  ],
}

export default defineType({
  name: 'navigation',
  kind: 'single',
  label: 'Navigation',
  singular: 'Navigation',
  group: 'Site',
  icon: '🧭',
  description: 'Header, on-page rail and footer link groups.',
  fields: [
    { name: 'pageLinks', type: 'array', label: 'Header — page links', of: linkItem, group: 'Header' },
    { name: 'sectionLinks', type: 'array', label: 'Header — section anchors', of: linkItem, group: 'Header' },
    { name: 'headerCtaLabel', type: 'string', label: 'Header CTA label', group: 'Header' },
    { name: 'headerCtaUrl', type: 'url', label: 'Header CTA URL', group: 'Header' },
    { name: 'railLinks', type: 'array', label: 'Section rail', of: linkItem, group: 'Rail' },
    {
      name: 'footerColumns',
      type: 'array',
      label: 'Footer columns',
      group: 'Footer',
      of: {
        type: 'object',
        fields: [
          { name: 'title', type: 'string', label: 'Column title', required: true },
          { name: 'links', type: 'array', label: 'Links', of: linkItem },
        ],
      },
    },
    { name: 'legalLinks', type: 'array', label: 'Footer legal links', of: linkItem, group: 'Footer' },
  ],
})
