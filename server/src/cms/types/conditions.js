import { defineType } from '../defineType.js'

/** The "When to see a urologist" triage cards (DoctorAdvice component). */
export default defineType({
  name: 'conditions',
  label: 'Triage Cards',
  singular: 'Triage Card',
  group: 'Clinical',
  icon: '🚦',
  description: 'The urgency cards in the "Doctor\'s Advice" section — what to watch for and how soon to call.',
  listColumns: ['name', 'urgency', 'status', 'order'],
  searchFields: ['name', 'subtitle', 'clinicalNote'],
  fields: [
    { name: 'name', type: 'string', label: 'Condition', required: true, listColumn: true },
    { name: 'subtitle', type: 'string', label: 'Clinical name', help: 'e.g. "Haematuria".' },
    {
      name: 'urgency',
      type: 'select',
      label: 'Urgency',
      required: true,
      listColumn: true,
      default: 'Routine',
      options: [
        { value: 'Immediate', label: 'Immediate — same day / ER' },
        { value: 'Prompt', label: 'Prompt — within days' },
        { value: 'Routine', label: 'Routine — next appointment' },
        { value: 'Planned', label: 'Planned — scheduled evaluation' },
      ],
    },
    { name: 'urgencyColor', type: 'color', label: 'Urgency colour', default: '#2a7a3a' },
    { name: 'icon', type: 'svg', label: 'Icon (SVG)', help: 'Inline <svg> markup, 32×32 viewBox.' },
    {
      name: 'symptoms',
      type: 'array',
      label: 'Symptoms',
      of: { type: 'string', label: 'Symptom' },
    },
    { name: 'clinicalNote', type: 'text', label: 'Clinical note', required: true },
    { name: 'whenToCall', type: 'text', label: 'When to call', required: true },
    {
      name: 'treatment',
      type: 'reference',
      label: 'Linked treatment page',
      refModel: 'Treatments',
      help: 'Optional — links the card through to a full treatment page.',
    },
  ],
})
