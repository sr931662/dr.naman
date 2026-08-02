/** Clinic locations and standalone pages, migrated from client/src/pages/Contact.jsx. */

export const locations = [
  {
    name: 'Manipal Hospital, Dwarka',
    kind: 'primary',
    addressLine: 'Palam Vihar Colony, Sector 6, Dwarka',
    landmark: 'Near MTNL Office',
    city: 'Delhi',
    phone: '+911142888888',
    consultationFee: 1500,
    teleconsultation: true,
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.151058565209!2d77.06684367614186!3d28.595244775685092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b3ae0cf4f6f%3A0xec55552f03c1526d!2sManipal%20Hospital%20Delhi!5e0!3m2!1sen!2sin!4v1782467063048!5m2!1sen!2sin',
    schedule: [
      { days: 'Tue & Sat', hours: '9:00 AM – 3:00 PM', note: '' },
      { days: 'Wed – Thu', hours: '11:00 AM – 3:00 PM', note: '' },
    ],
    directions: [
      { mode: 'By Metro', detail: 'Dwarka Sector 10 (Blue Line) → 5 min cab' },
      { mode: 'By Road', detail: 'Dwarka Expressway / Palam Road, Sector 6' },
      { mode: 'From Airport', detail: 'IGI Terminal 3 → 15 min via NH-48 / Palam Road' },
    ],
  },
  {
    name: 'Veena Nursing Home',
    kind: 'secondary',
    addressLine: 'Pocket A-1, Sector 8',
    landmark: 'Near Deepali Chowk',
    city: 'Delhi',
    consultationFee: 1000,
    teleconsultation: false,
    schedule: [
      { days: 'Mon – Sat', hours: '6:30 – 8:30 AM', note: 'Early morning slot' },
      { days: 'Mon – Sat', hours: '7:00 – 9:00 PM', note: 'Evening slot' },
    ],
    directions: [],
  },
  {
    name: 'Maharaja Agarsain Hospital',
    kind: 'oncall',
    addressLine: 'D Block, Ashok Vihar Phase 1',
    city: 'Delhi',
    teleconsultation: false,
    schedule: [{ days: 'On-call basis', hours: 'By prior arrangement', note: '' }],
    directions: [],
  },
]

export const pages = [
  {
    title: 'About Dr. Naman Aggarwal',
    slug: 'about',
    summary: 'Consultant Urologist, Andrologist & Laparoscopic Surgeon at Manipal Hospital, Dwarka, Delhi — eleven years of focused urological practice.',
    blocks: [
      {
        type: 'prose',
        heading: 'A surgeon shaped by two disciplines',
        body: '<p>Dr. Naman Aggarwal is a Consultant Urologist, Andrologist and Laparoscopic Surgeon practising at Manipal Hospital, Dwarka, Delhi. He holds an MBBS, an MS in General Surgery, and an MCh in Urology / Genito-Urinary Surgery, with eleven years of overall clinical experience.</p><p>His practice spans the full spectrum of urological conditions, with particular depth in minimally invasive technique — Retrograde Intrarenal Surgery (RIRS) for kidney stones, Holmium Laser Enucleation of the Prostate (HoLEP) for benign prostatic hyperplasia, and laparoscopic approaches to uro-oncological surgery.</p>',
      },
      {
        type: 'stats',
        heading: 'At a glance',
        items: [
          { label: 'Years in practice', value: '11' },
          { label: 'Primary hospital', value: 'Manipal, Dwarka' },
          { label: 'Andrology certification', value: 'ASRM' },
          { label: 'Fellowship', value: 'Devon Traveling Fellowship' },
        ],
      },
      {
        type: 'prose',
        heading: 'Andrology and male fertility',
        body: '<p>Dr. Aggarwal is certified in andrology by the American Society for Reproductive Medicine and completed an observership at First IVF, Dubai. He takes a structured, evidence-based approach to male fertility — from full andrological evaluation through microsurgical varicocelectomy and surgical sperm retrieval.</p>',
      },
      {
        type: 'cta',
        heading: 'Book a consultation',
        body: '<p>In person at Manipal Hospital Dwarka, or by teleconsultation. The clinic responds within 24 hours.</p>',
        items: [{ label: 'Book now', url: '/contact' }],
      },
    ],
    seo: {
      title: 'About Dr. Naman Aggarwal — Consultant Urologist, Dwarka',
      description: 'MBBS, MS, MCh Urology. ASRM-certified in andrology, Devon Traveling Fellow. Eleven years of urological practice at Manipal Hospital, Dwarka, Delhi.',
    },
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    summary: 'How this website handles the information you share with it.',
    blocks: [
      {
        type: 'prose',
        body: '<p>This website collects only the information you choose to submit through the consultation form: your name, phone number, optional email address, preferred appointment time, and the description of your symptoms or reason for consultation.</p><h3>How your information is used</h3><p>Submitted details are used solely to contact you about your consultation request and to arrange an appointment. They are not sold, rented, or shared with third parties for marketing.</p><h3>Storage and retention</h3><p>Consultation requests are stored on the clinic\'s systems and retained for as long as needed to provide continuity of care, then deleted.</p><h3>Analytics</h3><p>This site uses cookieless analytics that count page views without storing personal identifiers or tracking you across other websites.</p><h3>Your rights</h3><p>You may request a copy or the deletion of any information you have submitted by contacting the clinic using the details on the contact page.</p>',
      },
    ],
    seo: { noindex: false },
  },
  {
    title: 'Terms of Use',
    slug: 'terms',
    summary: 'The terms under which this website is provided.',
    blocks: [
      {
        type: 'prose',
        body: '<p>The clinical information on this website is provided for general patient education. It describes conditions and treatments in general terms and cannot account for your individual medical history.</p><h3>Not medical advice</h3><p>Nothing on this site constitutes medical advice or creates a doctor-patient relationship. Always consult a qualified doctor about your own symptoms before acting on anything you read here.</p><h3>Emergencies</h3><p>If you have severe pain, fever with urinary symptoms, an inability to pass urine, or sudden testicular pain, seek emergency care immediately rather than using the contact form.</p><h3>Accuracy</h3><p>Clinical content is cross-checked against recognised sources and reviewed periodically, but medicine changes and no guarantee of completeness is given.</p>',
      },
    ],
    seo: { noindex: false },
  },
]
