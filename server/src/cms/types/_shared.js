/** Field fragments reused across several content types. */

export const seoField = (overrides = {}) => ({
  name: 'seo',
  type: 'object',
  label: 'SEO',
  group: 'SEO',
  help: 'Leave blank to fall back to the page title and excerpt.',
  fields: [
    { name: 'title', type: 'string', label: 'Meta title', maxLength: 70 },
    { name: 'description', type: 'text', label: 'Meta description', maxLength: 180 },
    { name: 'keywords', type: 'string', label: 'Keywords', help: 'Comma separated.' },
    { name: 'ogImage', type: 'image', label: 'Social share image' },
    { name: 'noindex', type: 'boolean', label: 'Hide from search engines' },
  ],
  ...overrides,
})

export const eyebrowField = () => ({
  name: 'eyebrow',
  type: 'string',
  label: 'Eyebrow',
  help: 'Small uppercase label above the heading.',
})

/** The bullet list shape used across treatment content ("Symptoms", etc.). */
export const bulletList = (name, label, help) => ({
  name,
  type: 'array',
  label,
  help,
  of: { type: 'string', label: 'Point' },
})

/** Title + description pairs, used for treatment options and philosophy cards. */
export const titledList = (name, label, help) => ({
  name,
  type: 'array',
  label,
  help,
  of: {
    type: 'object',
    fields: [
      { name: 'title', type: 'string', label: 'Title', required: true },
      { name: 'text', type: 'text', label: 'Description' },
    ],
  },
})

export const faqList = (name = 'faqs', label = 'FAQs') => ({
  name,
  type: 'array',
  label,
  of: {
    type: 'object',
    fields: [
      { name: 'q', type: 'string', label: 'Question', required: true },
      { name: 'a', type: 'text', label: 'Answer', required: true },
    ],
  },
})
