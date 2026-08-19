/**
 * Treatment card summaries, migrated from the TREATMENTS array in
 * client/src/components/Gallery.jsx. The JSX icons have been converted to
 * plain SVG strings (camelCase attributes → kebab-case) so they can be stored
 * as content and rendered with dangerouslySetInnerHTML.
 */
export const treatmentCards = [
  {
    slug: 'kidney-stones',
    title: 'Kidney Stones',
    sub: 'RIRS · PCNL · Ureteroscopy',
    tag: 'High volume',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <ellipse cx="24" cy="19" rx="9" ry="12" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M18 31 C18 38 30 38 30 31" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M24 31v8" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M20 39h8" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="24" cy="19" r="3" fill="var(--blush)" stroke="var(--crimson)" stroke-width="1"/>
</svg>`,
  },
  {
    slug: 'prostate-bph',
    title: 'Prostate (BPH)',
    sub: 'HoLEP · TURP · Medical',
    tag: 'Gold standard HoLEP',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <circle cx="24" cy="24" r="13" stroke="var(--crimson)" stroke-width="1.5" opacity=".4"/>
  <path d="M14 28 C14 34 34 34 34 28 C34 22 14 22 14 28Z" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M24 22v4M24 34v2" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,
  },
  {
    slug: 'male-infertility',
    title: 'Male Infertility',
    sub: 'Varicocele · Microsurgery · ASRM',
    tag: 'ASRM certified',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M16 12 C16 22 14 26 14 32 C14 38 34 38 34 32 C34 26 32 22 32 12" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M19 12 C19 20 17 24 17 30" stroke="var(--crimson)" stroke-width="1" stroke-linecap="round" opacity=".4"/>
  <circle cx="24" cy="30" r="5" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M24 30 m-3 0 a3 3 0 0 1 6 0" fill="rgba(179,18,42,.15)"/>
</svg>`,
  },
  {
    slug: 'blood-in-urine',
    title: 'Blood in Urine',
    sub: 'Haematuria · Cystoscopy',
    tag: 'Urgent evaluation',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M10 24 L16 18 L20 22 L24 14 L28 26 L32 20 L36 24 L38 24" stroke="var(--crimson)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="24" cy="32" r="6" stroke="var(--crimson)" stroke-width="1.5" opacity=".5"/>
  <circle cx="24" cy="32" r="2.5" fill="var(--crimson)" opacity=".7"/>
</svg>`,
  },
  {
    slug: 'urinary-tract-infection',
    title: 'Urinary Tract Infection',
    sub: 'UTI · Recurrent UTI',
    tag: 'Diagnosis & treatment',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <ellipse cx="24" cy="22" rx="10" ry="14" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M24 36v6M20 40h8" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 18 C18 14 22 12 24 12 C26 12 30 14 30 18" stroke="var(--crimson)" stroke-width="1" stroke-linecap="round" opacity=".5"/>
  <circle cx="24" cy="22" r="4" fill="var(--blush)" stroke="var(--crimson)" stroke-width="1"/>
</svg>`,
  },
  {
    slug: 'uro-oncology',
    title: 'Uro-oncology',
    sub: 'Kidney · Prostate · Bladder',
    tag: 'Organ-preserving surgery',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <circle cx="20" cy="20" r="9" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M26 26 L38 38" stroke="var(--crimson)" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M17 17 L23 23 M20 14 v3 M14 20 h3" stroke="var(--crimson)" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="3" fill="rgba(179,18,42,.2)"/>
</svg>`,
  },
  {
    slug: 'urinary-obstruction',
    title: 'Urinary Obstruction',
    sub: 'UPJ · Stricture · Bladder outlet',
    tag: 'Minimally invasive',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M12 16 C12 28 36 28 36 16" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 28 C18 36 30 36 30 28" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="24" cy="28" r="2" fill="var(--crimson)"/>
  <path d="M20 16 C20 10 28 10 28 16" stroke="var(--crimson)" stroke-width="1" stroke-linecap="round" opacity=".5"/>
</svg>`,
  },
  {
    slug: 'urinary-incontinence',
    title: 'Urinary Incontinence',
    sub: 'Stress · Urge · Mixed',
    tag: 'Diagnostic & surgical',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <rect x="10" y="18" width="28" height="16" rx="3" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M18 18 v-4 a3 3 0 0 1 6 0 v4" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="24" cy="26" r="4" stroke="var(--crimson)" stroke-width="1.5"/>
  <circle cx="24" cy="26" r="1.5" fill="var(--crimson)"/>
</svg>`,
  },
  {
    slug: 'testicular-conditions',
    title: 'Testicular Conditions',
    sub: 'Torsion · Mass · Pain',
    tag: 'Urgent & elective',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M14 16 C14 26 18 30 24 30 C30 30 34 26 34 16" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="24" cy="30" rx="7" ry="5" stroke="var(--crimson)" stroke-width="1.5" opacity=".5"/>
  <path d="M24 35 v6" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 39 h12" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="19" cy="16" r="2.5" fill="var(--blush)" stroke="var(--crimson)" stroke-width="1"/>
  <circle cx="29" cy="16" r="2.5" fill="var(--blush)" stroke="var(--crimson)" stroke-width="1"/>
</svg>`,
  },
  {
    slug: 'renal-transplant',
    title: 'Renal Transplant',
    sub: 'Living donor · Deceased donor',
    tag: 'End-to-end care',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M24 10 C16 10 10 16 10 24 C10 32 16 38 24 38 C32 38 38 32 38 24" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3"/>
  <path d="M28 10 L38 10 L38 20" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M38 10 L28 20" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="5" stroke="var(--crimson)" stroke-width="1.5"/>
</svg>`,
  },
  {
    slug: 'erectile-dysfunction',
    title: 'Erectile Dysfunction',
    sub: 'ED · Andrological evaluation',
    tag: 'Confidential care',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M14 24 C14 32 22 38 24 38 C26 38 34 32 34 24 C34 16 29 11 24 11 C19 11 14 16 14 24Z" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M20 22 C20 20 22 18 24 18 C26 18 28 20 28 22 C28 26 24 30 24 30 C24 30 20 26 20 22Z" fill="rgba(179,18,42,.15)" stroke="var(--crimson)" stroke-width="1"/>
</svg>`,
  },
  {
    slug: 'urology-consultation',
    title: 'Urology Consultation',
    sub: 'OPD · Second opinion · Reports',
    tag: '₹1500 · Men\'s Health Corner',
    icon: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <rect x="11" y="10" width="26" height="32" rx="3" stroke="var(--crimson)" stroke-width="1.5" opacity=".4"/>
  <path d="M16 18 h16 M16 24 h16 M16 30 h10" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="35" cy="35" r="7" fill="var(--paper)" stroke="var(--crimson)" stroke-width="1.5"/>
  <path d="M32 35 h6 M35 32 v6" stroke="var(--crimson)" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,
  },
]
