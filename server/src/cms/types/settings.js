import { defineType } from '../defineType.js'
import { seoField } from './_shared.js'

/**
 * The site-wide singleton. Everything the frontend currently hard-codes in
 * config/seo.js, App.jsx (WhatsApp) and Footer.jsx lives here.
 */
export default defineType({
  name: 'settings',
  kind: 'single',
  label: 'Site Settings',
  singular: 'Site Settings',
  group: 'Site',
  icon: '⚙️',
  description: 'Global identity, contact details and social links used across every page.',
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────
    { name: 'siteName', type: 'string', label: 'Site name', required: true, group: 'Identity' },
    { name: 'siteUrl', type: 'url', label: 'Production URL', required: true, group: 'Identity' },
    { name: 'tagline', type: 'string', label: 'Tagline', group: 'Identity' },
    { name: 'logoText', type: 'string', label: 'Logo monogram', maxLength: 3, group: 'Identity', help: 'The single letter shown in the footer badge.' },

    // ── Doctor ────────────────────────────────────────────────────────────
    {
      name: 'doctor',
      type: 'object',
      label: 'Doctor profile',
      group: 'Doctor',
      fields: [
        { name: 'name', type: 'string', label: 'Full name', required: true },
        { name: 'jobTitle', type: 'string', label: 'Job title' },
        { name: 'qualifications', type: 'string', label: 'Qualifications', help: 'e.g. MBBS, MS, MCh Urology' },
        { name: 'experienceYears', type: 'number', label: 'Years of experience', integer: true, min: 0 },
        { name: 'bio', type: 'text', label: 'Short bio' },
        { name: 'portrait', type: 'image', label: 'Portrait photo' },
        {
          name: 'medicalSpecialty',
          type: 'array',
          label: 'Medical specialties',
          help: 'Emitted in the Physician structured-data block.',
          of: { type: 'string', label: 'Specialty' },
        },
        { name: 'hospital', type: 'string', label: 'Primary hospital' },
        { name: 'addressLocality', type: 'string', label: 'Locality' },
        { name: 'addressRegion', type: 'string', label: 'Region' },
        { name: 'addressCountry', type: 'string', label: 'Country code', maxLength: 2 },
      ],
    },

    // ── Contact ───────────────────────────────────────────────────────────
    {
      name: 'contact',
      type: 'object',
      label: 'Contact',
      group: 'Contact',
      fields: [
        { name: 'email', type: 'email', label: 'Public email' },
        { name: 'phone', type: 'phone', label: 'Primary phone' },
        { name: 'phoneLabel', type: 'string', label: 'Phone label', help: 'e.g. "Manipal Hospital Dwarka"' },
        { name: 'whatsappNumber', type: 'string', label: 'WhatsApp number', help: 'Country code first, digits only, no + or spaces — e.g. 91XXXXXXXXXX for India.' },
        { name: 'whatsappMessage', type: 'text', label: 'WhatsApp prefilled message' },
        { name: 'responseTime', type: 'string', label: 'Response promise', help: 'e.g. "Response within 24 hours"' },
      ],
    },

    // ── Social ────────────────────────────────────────────────────────────
    {
      name: 'social',
      type: 'array',
      label: 'Social links',
      group: 'Social',
      of: {
        type: 'object',
        fields: [
          {
            name: 'platform',
            type: 'select',
            label: 'Platform',
            required: true,
            options: ['linkedin', 'instagram', 'youtube', 'facebook', 'x', 'other'],
          },
          { name: 'label', type: 'string', label: 'Display label', help: 'e.g. @drnaman.uro' },
          { name: 'url', type: 'url', label: 'URL', required: true },
          { name: 'visible', type: 'boolean', label: 'Show on site', default: true },
        ],
      },
    },

    // ── Announcement bar ──────────────────────────────────────────────────
    {
      name: 'announcement',
      type: 'object',
      label: 'Announcement bar',
      group: 'Site',
      help: 'Optional strip for temporary notices (leave the text blank to hide it).',
      fields: [
        { name: 'enabled', type: 'boolean', label: 'Enabled' },
        { name: 'text', type: 'string', label: 'Message' },
        { name: 'linkLabel', type: 'string', label: 'Link label' },
        { name: 'linkUrl', type: 'url', label: 'Link URL' },
      ],
    },

    // ── Legal / footer ────────────────────────────────────────────────────
    { name: 'copyright', type: 'string', label: 'Copyright line', group: 'Footer' },
    { name: 'medicalDisclaimer', type: 'text', label: 'Medical disclaimer', group: 'Footer' },

    // ── Integrations ──────────────────────────────────────────────────────
    {
      name: 'integrations',
      type: 'object',
      label: 'Integrations',
      group: 'Integrations',
      fields: [
        { name: 'googleAnalyticsId', type: 'string', label: 'Google Analytics ID' },
        { name: 'googleMapsEmbed', type: 'text', label: 'Default Google Maps embed URL' },
        { name: 'practoUrl', type: 'url', label: 'Practo profile' },
      ],
    },

    seoField({ label: 'Default SEO' }),
  ],
})
