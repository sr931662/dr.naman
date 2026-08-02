import { defineType } from '../defineType.js'
import { seoField, bulletList, titledList, faqList } from './_shared.js'

/**
 * Treatments drive both the home-page Gallery cards and the full
 * /treatments/:slug detail pages — one record holds the card summary and the
 * long-form patient-education content that TREATMENT_CONTENT used to hold.
 */
export default defineType({
  name: 'treatments',
  label: 'Treatments',
  singular: 'Treatment',
  group: 'Clinical',
  icon: '🩺',
  description: 'Conditions and procedures — powers the home Gallery cards and each /treatments/:slug page.',
  listColumns: ['title', 'tag', 'status', 'order'],
  searchFields: ['title', 'sub', 'overview'],
  fields: [
    // ── Card ──────────────────────────────────────────────────────────────
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true, group: 'Card' },
    { name: 'slug', type: 'slug', label: 'URL slug', required: true, unique: true, group: 'Card', help: 'Used in /treatments/<slug>.' },
    { name: 'sub', type: 'string', label: 'Subtitle', group: 'Card', help: 'The procedure line, e.g. "RIRS · PCNL · Ureteroscopy".' },
    { name: 'tag', type: 'string', label: 'Badge', listColumn: true, group: 'Card', help: 'Small pill, e.g. "High volume".' },
    { name: 'icon', type: 'svg', label: 'Card icon (SVG)', group: 'Card', help: 'Inline <svg> markup, 48×48 viewBox.' },
    { name: 'image', type: 'image', label: 'Header image', group: 'Card' },
    { name: 'featured', type: 'boolean', label: 'Feature on home page', default: true, group: 'Card' },

    // ── Detail page ───────────────────────────────────────────────────────
    { name: 'overview', type: 'text', label: 'Overview', group: 'Detail', help: 'Plain-language explanation of the condition.' },
    { name: 'howCommon', type: 'text', label: 'How common is it?', group: 'Detail' },
    { name: 'keyStat', type: 'text', label: 'Key statistic', group: 'Detail', help: 'Pulled out as a highlight — always cite the source.' },
    bulletList('causes', 'Causes & risk factors'),
    {
      name: 'symptoms',
      type: 'array',
      label: 'Symptoms',
      group: 'Detail',
      of: {
        type: 'object',
        fields: [
          { name: 'text', type: 'text', label: 'Symptom', required: true },
          { name: 'urgent', type: 'boolean', label: 'Red-flag symptom', help: 'Highlighted as needing urgent care.' },
        ],
      },
    },
    { ...bulletList('diagnosis', 'How it is diagnosed'), group: 'Detail' },
    { ...titledList('treatments', 'Treatment options'), group: 'Detail' },
    { name: 'outlook', type: 'text', label: 'Outlook & prevention', group: 'Detail' },
    { ...bulletList('seeDoctor', 'When to see a doctor'), group: 'Detail' },
    { ...faqList(), group: 'Detail' },

    // ── Sources ───────────────────────────────────────────────────────────
    {
      name: 'sources',
      type: 'array',
      label: 'Clinical sources',
      group: 'Detail',
      help: 'Reference material this page was cross-checked against.',
      of: {
        type: 'object',
        fields: [
          { name: 'name', type: 'string', label: 'Source', required: true },
          { name: 'url', type: 'url', label: 'URL' },
        ],
      },
    },
    { name: 'lastReviewed', type: 'date', label: 'Last clinically reviewed', group: 'Detail' },

    seoField(),
  ],
})
