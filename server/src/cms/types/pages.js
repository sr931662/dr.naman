import { defineType } from '../defineType.js'
import { seoField } from './_shared.js'

/**
 * Generic pages (About, Privacy, Terms…) built from a small set of
 * composable blocks, so new pages don't need a code change.
 */
export default defineType({
  name: 'pages',
  label: 'Pages',
  singular: 'Page',
  group: 'Site',
  icon: '📃',
  description: 'Standalone pages such as About, Privacy Policy and Terms.',
  orderable: false,
  listColumns: ['title', 'slug', 'status', 'updatedAt'],
  searchFields: ['title', 'summary'],
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true },
    { name: 'slug', type: 'slug', label: 'URL slug', required: true, unique: true, listColumn: true },
    { name: 'summary', type: 'text', label: 'Summary' },
    { name: 'heroImage', type: 'image', label: 'Hero image' },
    {
      name: 'blocks',
      type: 'array',
      label: 'Content blocks',
      group: 'Content',
      of: {
        type: 'object',
        fields: [
          {
            name: 'type',
            type: 'select',
            label: 'Block type',
            required: true,
            default: 'prose',
            options: [
              { value: 'prose', label: 'Rich text' },
              { value: 'quote', label: 'Pull quote' },
              { value: 'stats', label: 'Stat row' },
              { value: 'list', label: 'Bulleted list' },
              { value: 'image', label: 'Image' },
              { value: 'cta', label: 'Call to action' },
            ],
          },
          { name: 'heading', type: 'string', label: 'Heading' },
          { name: 'body', type: 'richtext', label: 'Body' },
          { name: 'image', type: 'image', label: 'Image' },
          {
            name: 'items',
            type: 'array',
            label: 'Items',
            help: 'Used by the stat, list and CTA blocks.',
            of: {
              type: 'object',
              fields: [
                { name: 'label', type: 'string', label: 'Label' },
                { name: 'value', type: 'string', label: 'Value' },
                { name: 'url', type: 'url', label: 'URL' },
              ],
            },
          },
        ],
      },
    },
    seoField(),
  ],
})
