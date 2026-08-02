/**
 * Triage cards, migrated from the CONDITIONS array in
 * client/src/components/DoctorAdvice.jsx (JSX icons → SVG strings).
 */
export const conditions = [
  {
    name: 'Blood in Urine',
    subtitle: 'Haematuria',
    urgency: 'Immediate',
    urgencyColor: '#b3122a',
    treatmentSlug: 'blood-in-urine',
    icon: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <path d="M16 4 C16 4 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 4 16 4z" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <path d="M12 22 a5 5 0 0 0 8 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
</svg>`,
    symptoms: ['Pink, red, or brown urine', 'Visible clots', 'No pain but discoloured urine', 'Burning with urination'],
    clinicalNote: 'Any blood in urine requires evaluation to rule out bladder or kidney tumour, stones, or infection. Painless haematuria is especially concerning.',
    whenToCall: 'Same day — do not wait to see if it resolves on its own.',
  },
  {
    name: 'Kidney Stones',
    subtitle: 'Nephrolithiasis',
    urgency: 'Prompt',
    urgencyColor: '#d4660a',
    treatmentSlug: 'kidney-stones',
    icon: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <ellipse cx="14" cy="14" rx="9" ry="11" stroke="currentColor" stroke-width="1.6" transform="rotate(-20, 14, 14)"/>
  <path d="M10 10 l4 4 l2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="22" cy="22" r="4" stroke="currentColor" stroke-width="1.4"/>
  <path d="M20 22h4M22 20v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`,
    symptoms: ['Severe flank or back pain', 'Pain radiating to groin', 'Nausea and vomiting', 'Frequent urge to urinate'],
    clinicalNote: 'Stone size, location, and composition determine treatment. Most under 5mm pass spontaneously; larger stones or obstruction need intervention.',
    whenToCall: 'Within 24–48 hours, or immediately if fever accompanies pain (suggests infected obstruction — a urological emergency).',
  },
  {
    name: 'Enlarged Prostate',
    subtitle: 'Benign Prostatic Hyperplasia',
    urgency: 'Routine',
    urgencyColor: '#2a7a3a',
    treatmentSlug: 'prostate-bph',
    icon: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <ellipse cx="16" cy="18" rx="10" ry="8" stroke="currentColor" stroke-width="1.6"/>
  <path d="M16 10 v-4M13 7 l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 18 q4 3 8 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>
</svg>`,
    symptoms: ['Weak or slow urine stream', 'Frequent nighttime urination', 'Difficulty starting urination', 'Feeling of incomplete emptying'],
    clinicalNote: 'BPH is very common after 50. Untreated, it can lead to bladder damage or urinary retention. HoLEP offers durable, low-retreatment relief.',
    whenToCall: 'At your next available appointment — this is an elective condition unless complete urinary retention occurs.',
  },
  {
    name: 'Male Infertility',
    subtitle: 'Andrological Evaluation',
    urgency: 'Planned',
    urgencyColor: '#1a6ea6',
    treatmentSlug: 'male-infertility',
    icon: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <circle cx="12" cy="16" r="8" stroke="currentColor" stroke-width="1.6"/>
  <path d="M20 8 l4 0 0 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 12 l-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 16 a4 4 0 0 0 6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>
</svg>`,
    symptoms: ['Unable to conceive after 12 months of trying', 'Known low sperm count', 'Hormonal abnormalities', 'History of testicular surgery or injury'],
    clinicalNote: 'Male factor contributes to 40–50% of infertility cases. Varicocele, hormonal imbalance, and obstruction are often correctable.',
    whenToCall: 'Schedule a structured andrological evaluation — the earlier, the better for treatment outcomes.',
  },
  {
    name: 'Recurring UTIs',
    subtitle: 'Urinary Tract Infections',
    urgency: 'Prompt',
    urgencyColor: '#d4660a',
    treatmentSlug: 'urinary-tract-infection',
    icon: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <path d="M10 8 h12 v10 a6 6 0 0 1 -12 0 z" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <path d="M16 18 v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M13 26 h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="16" cy="13" r="1.5" fill="currentColor"/>
</svg>`,
    symptoms: ['More than 2 UTIs in 6 months', 'Burning urination', 'Pelvic discomfort', 'Blood-tinged urine with infection'],
    clinicalNote: 'Recurrent UTIs may signal an anatomical abnormality, bladder dysfunction, or stone. Investigation prevents antibiotic resistance.',
    whenToCall: 'Book within a week of a third recurrence — bring previous culture results.',
  },
  {
    name: 'Testicular Pain / Mass',
    subtitle: 'Scrotal Pathology',
    urgency: 'Immediate',
    urgencyColor: '#b3122a',
    treatmentSlug: 'testicular-conditions',
    icon: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <ellipse cx="11" cy="20" rx="7" ry="8" stroke="currentColor" stroke-width="1.6"/>
  <ellipse cx="21" cy="20" rx="7" ry="8" stroke="currentColor" stroke-width="1.6"/>
  <path d="M16 12 l-1-6a1 1 0 0 1 2 0 l-1 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`,
    symptoms: ['Sudden severe scrotal pain', 'Painless testicular lump', 'Swelling or heaviness', 'Pain radiating to lower abdomen'],
    clinicalNote: 'Testicular torsion is a surgical emergency (6-hour window). Any new testicular lump must be evaluated urgently to exclude testicular cancer.',
    whenToCall: 'Sudden pain: Emergency Room immediately. Painless lump: within 48 hours.',
  },
]
