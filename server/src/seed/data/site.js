/**
 * Site-wide content, migrated from client/src/config/seo.js, App.jsx,
 * Navbar.jsx, SectionRail.jsx and Footer.jsx.
 */

export const settings = {
  siteName: 'Dr. Naman Aggarwal — Urology, Andrology & Laparoscopic Surgery',
  siteUrl: 'https://drnamanaggarwal.com',
  tagline: 'Surgical precision, profoundly human care.',
  logoText: 'N',
  doctor: {
    name: 'Dr. Naman Aggarwal',
    jobTitle: 'Consultant Urologist, Andrologist & Laparoscopic Surgeon',
    qualifications: 'MBBS, MS General Surgery, MCh Urology / Genito-Urinary Surgery',
    experienceYears: 11,
    bio: 'Consultant Urologist, Andrologist & Laparoscopic Surgeon serving patients across Delhi. ASRM-certified in andrology and holder of the Devon Traveling Fellowship in advanced laparoscopic and robotic urological surgery.',
    medicalSpecialty: ['Urology', 'Andrology', 'Laparoscopic Surgery'],
    hospital: '',
    addressLocality: 'Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'IN',
  },
  contact: {
    email: 'info@drnamanaggarwal.com',
    phone: '+919811094112',
    phoneLabel: 'Dr. Naman Aggarwal',
    whatsappNumber: '919811094112',
    whatsappMessage: "Hi Dr. Naman, I'd like to book a consultation.",
    responseTime: 'Response within 24 hours',
  },
  social: [
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/andrologistdelhi/', visible: true },
    { platform: 'instagram', label: '@drnaman.uro', url: 'https://instagram.com/drnaman.uro', visible: true },
    { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@drnamanaggarwal', visible: true },
  ],
  announcement: { enabled: false, text: '', linkLabel: '', linkUrl: '' },
  copyright: `© ${new Date().getFullYear()} Dr. Naman Aggarwal. All rights reserved.`,
  medicalDisclaimer: 'The information on this website is for general education and does not replace a consultation with a qualified doctor. If your symptoms are severe or worsening, seek medical care immediately.',
  integrations: {
    googleAnalyticsId: '',
    googleMapsEmbed: '',
    practoUrl: '',
  },
  seo: {
    title: 'Urologist in Delhi | Dr. Naman Aggarwal',
    description: 'Consultant Urologist & Andrologist serving patients across Delhi. MCh Urology, 11 years experience in kidney stones, HoLEP, male infertility and renal transplant.',
    keywords: 'urologist Delhi, kidney stone treatment Delhi, HoLEP, male infertility, renal transplant, RIRS',
    noindex: false,
  },
}

export const navigation = {
  pageLinks: [
    { label: 'Blog', url: '/blog', external: false },
    { label: 'About', url: '/about', external: false },
  ],
  sectionLinks: [
    { label: 'Expertise', url: '#expertise', external: false },
    { label: 'Patient Guide', url: '#advice', external: false },
    { label: 'Journey', url: '#journey', external: false },
    { label: 'Voices', url: '#voices', external: false },
  ],
  headerCtaLabel: 'Book a consultation',
  headerCtaUrl: '/contact',
  railLinks: [
    { label: 'Top', url: '#top' },
    { label: 'Treatments', url: '#treatments' },
    { label: 'Guide', url: '#advice' },
    { label: 'Atlas', url: '#expertise' },
    { label: 'Gallery', url: '#gallery' },
    { label: 'Philosophy', url: '#philosophy' },
    { label: 'Journey', url: '#journey' },
    { label: 'Research', url: '#research' },
    { label: 'Voices', url: '#voices' },
    { label: 'FAQ', url: '#faq' },
  ],
  footerColumns: [
    {
      title: 'Explore',
      links: [
        { label: 'Treatments', url: '/#treatments' },
        { label: 'Patient Guide', url: '/#advice' },
        { label: 'Journey', url: '/#journey' },
        { label: 'Blog', url: '/blog' },
        { label: 'About', url: '/about' },
      ],
    },
    {
      title: 'Conditions',
      links: [
        { label: 'Kidney Stones', url: '/treatments/kidney-stones' },
        { label: 'Prostate (BPH)', url: '/treatments/prostate-bph' },
        { label: 'Male Infertility', url: '/treatments/male-infertility' },
        { label: 'Blood in Urine', url: '/treatments/blood-in-urine' },
        { label: 'Renal Transplant', url: '/treatments/renal-transplant' },
      ],
    },
    {
      title: 'Visit',
      links: [
        { label: 'Book a consultation', url: '/contact' },
        { label: 'Clinic Locations', url: '/contact' },
        { label: 'Teleconsultation', url: '/contact' },
      ],
    },
  ],
  legalLinks: [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms of Use', url: '/terms' },
  ],
}

export const hero = {
  eyebrow: 'Consultant Urologist · Delhi',
  headlineWords: ['Surgical', 'precision,', 'profoundly', 'human', 'care.'],
  subheading: 'Urology, andrology and laparoscopic surgery across Delhi — eleven years of focused practice in kidney stones, prostate disease, male fertility and renal transplantation.',
  ctas: [
    { label: 'Book a consultation', url: '/contact', variant: 'primary' },
    { label: 'Explore treatments', url: '#treatments', variant: 'ghost' },
  ],
  stats: [
    { value: '11 yrs', label: 'Clinical experience' },
    { value: 'MCh', label: 'Urology / Genito-Urinary Surgery' },
    { value: 'ASRM', label: 'Certified in andrology' },
  ],
}

/** Editable copy for each section header on the site. */
export const sections = [
  { key: 'home-treatments', eyebrow: 'Areas of Expertise', heading: 'Treatments & <em>procedures</em>', lead: 'Comprehensive urological care, from same-day stone surgery to complex reconstruction and transplantation.', order: 0 },
  { key: 'home-advice', eyebrow: "The Doctor's Advice", heading: 'When should you <em>call</em>?', lead: 'A quick triage guide — what the symptom usually means, and how urgently it needs attention.', order: 1 },
  { key: 'home-atlas', eyebrow: 'The Living Atlas', heading: 'A surgeon\'s <em>map</em>', lead: 'Urology, andrology, uro-oncology and transplantation — four disciplines, one continuum of care.', order: 2 },
  { key: 'home-reels', eyebrow: 'Watch & Learn', heading: 'Explained in <em>minutes</em>', lead: "Short, clear videos on urological conditions — from Dr. Aggarwal's clinical perspective.", order: 3 },
  { key: 'home-gallery', eyebrow: 'In Practice', heading: 'The doctor & <em>the clinic</em>', lead: 'Eleven years of focused urological practice across Delhi — where precision meets patient-first care.', order: 4 },
  { key: 'home-philosophy', eyebrow: 'The Philosophy', heading: 'How care is <em>practised</em>', lead: '"A scan shows me the disease. A conversation shows me the person. I refuse to treat one without the other."', order: 5 },
  { key: 'home-journey', eyebrow: 'The Making of a Surgeon', heading: 'Training that crosses<br/>borders &amp; disciplines.', lead: '', order: 6 },
  { key: 'home-research', eyebrow: 'On the Podium', heading: 'Research &amp; talks', lead: 'A regular voice at international and national urological forums — sharing technique, evidence and outcomes with the wider surgical community.', order: 7 },
  { key: 'home-voices', eyebrow: 'In Their Words', heading: 'Voices of <em>patients</em>', lead: '', order: 8 },
  { key: 'home-blog', eyebrow: 'Reading Room', heading: 'Notes from <em>practice</em>', lead: 'Evidence-based writing on the conditions patients ask about most.', order: 9 },
  { key: 'home-faq', eyebrow: 'Common Questions', heading: 'Before you <em>visit</em>', lead: '', order: 10 },
  { key: 'home-cta', eyebrow: 'Next Step', heading: 'Book a <em>consultation</em>', lead: "In-person at Men's Health Corner or Veena Nursing Home, or by teleconsultation. Response within 24 hours.", ctaLabel: 'Book now', ctaUrl: '/contact', order: 11 },
  { key: 'contact-hero', eyebrow: 'Reach Out', heading: 'Book a <em>consultation</em>', lead: "Men's Health Corner & Veena Nursing Home, Delhi · Teleconsultation available · Response within 24 hours", order: 12 },
  { key: 'contact-form', eyebrow: '', heading: 'Send a message', lead: "Fill in your details and we'll get back to you within 24 hours to confirm your appointment.", order: 13 },
  { key: 'blog-hero', eyebrow: 'Reading Room', heading: 'Notes from <em>practice</em>', lead: 'Patient education, surgical advances and evidence-based urology.', order: 14 },
]
