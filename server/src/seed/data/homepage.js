/**
 * Home-page collections, migrated from the corresponding React components.
 */

export const philosophy = [
  {
    kicker: '01',
    title: 'Listen deeply',
    body: 'A compassionate listener who takes the time to understand every concern — simplifying complex medicine until patients and families feel genuinely informed and assured.',
  },
  {
    kicker: '02',
    title: 'Operate precisely',
    body: 'At the forefront of robotic and minimally-invasive technique, always seeking the latest evidence-based advances to sharpen outcomes and shorten recovery.',
  },
  {
    kicker: '03',
    title: 'Care completely',
    body: 'A multidisciplinary approach for complex cases and comorbidities, with an unwavering commitment to confidentiality and the highest standards of ethical practice.',
  },
]

export const journey = [
  {
    side: 'left',
    year: 'Certification · ASRM',
    title: 'Andrology Certification',
    desc: 'Awarded by the American Society for Reproductive Medicine — formal credentialing in male fertility and reproductive surgery.',
  },
  {
    side: 'right',
    year: 'Observership · Dubai',
    title: 'First IVF, Dubai (UAE)',
    desc: 'International observership in advanced reproductive medicine, deepening expertise in andrology and assisted fertility.',
  },
  {
    side: 'left',
    year: '2022 · Fellowship',
    title: 'Devon Traveling Fellowship',
    desc: 'A competitive traveling fellowship recognising surgical promise and a commitment to evolving urological practice.',
  },
  {
    side: 'right',
    year: '2022 · Symposium',
    title: 'KUACON · Davangere PG Symposium',
    desc: 'Active contribution to the postgraduate urological community through regional academic symposia.',
  },
  {
    side: 'left',
    year: 'Present · Delhi',
    title: "Urologist, Kidney Transplant Surgeon and Men's Health Specialist — Delhi",
    desc: "Consultant urologist, kidney transplant surgeon and men's health specialist based out of Delhi, practising across kidney stones, prostate disease, genitourinary cancers, male fertility and renal transplantation.",
  },
]

export const research = [
  { title: "Invited speaker — Société Internationale d'Urologie (SIU)", meta: 'International', kind: 'talk', venue: 'SIU' },
  { title: 'Speaker — Urological Association of Asia (UAA)', meta: 'International', kind: 'talk', venue: 'UAA' },
  { title: 'Speaker — USICON, Urological Society of India', meta: 'National', kind: 'talk', venue: 'USICON' },
  { title: 'Active participant — regional & national conferences', meta: 'Ongoing', kind: 'talk', venue: 'KUACON and others' },
]

export const credentials = [
  { emphasis: "Men's Health Corner", text: '· Manipal Hospital · Veena Nursing Home, Delhi' },
  { emphasis: 'Reproductive Medicine', text: 'American Society for' },
  { emphasis: 'First IVF', text: 'Dubai · Observership' },
  { emphasis: 'Devon', text: 'Traveling Fellowship' },
  { emphasis: 'SIU · UAA · USICON', text: 'Speaker ·' },
]

export const reels = [
  { title: 'What is RIRS?', platform: 'youtube', duration: '2:14', views: '12K', desc: 'Flexible ureteroscopy explained simply', gradient: 'linear-gradient(160deg,#1a0a0e,#3d1020,#6b1f36)' },
  { title: 'HoLEP vs TURP', platform: 'youtube', duration: '3:40', views: '8.2K', desc: 'Why HoLEP is now preferred for BPH', gradient: 'linear-gradient(160deg,#0d0d14,#1a1a2e,#2a2850)' },
  { title: 'Varicocele & Male Fertility', platform: 'instagram', duration: '0:58', views: '21K', desc: 'The link between varicocele and infertility', gradient: 'linear-gradient(160deg,#0f1a12,#1a3020,#2a4a2e)' },
  { title: 'Living Donor Transplant', platform: 'youtube', duration: '4:10', views: '6.7K', desc: 'What to expect as a living kidney donor', gradient: 'linear-gradient(160deg,#1a1410,#2e2218,#4a3828)' },
  { title: 'Blood in Urine — When to Worry', platform: 'instagram', duration: '1:05', views: '34K', desc: 'Haematuria: causes and when to act', gradient: 'linear-gradient(160deg,#1a0a0e,#2e0f1c,#501428)' },
  { title: 'Robotic Surgery in Urology', platform: 'youtube', duration: '5:22', views: '9.8K', desc: 'The Da Vinci robot in urological practice', gradient: 'linear-gradient(160deg,#0e1218,#192030,#243040)' },
]

export const photos = [
  {
    label: 'Dr. Naman Aggarwal',
    sub: 'MCh Urology · ASRM · Consultant Urologist, Delhi',
    featured: true,
    image: { url: '/uploads/seed/dr-naman.png', alt: 'Dr. Naman Aggarwal — Consultant Urologist, Delhi' },
  },
  {
    label: 'OPD Consultation',
    sub: 'Consultation room · Delhi',
    image: {
      url: 'https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&w=800&q=80',
      alt: 'OPD consultation room',
    },
  },
  {
    label: 'Surgical Suite',
    sub: 'Minimally invasive · Laparoscopic',
    image: {
      url: 'https://images.unsplash.com/photo-1758206523711-f20bb01033a5?auto=format&fit=crop&w=800&q=80',
      alt: 'Surgical suite',
    },
  },
  {
    label: 'Endoscopy Unit',
    sub: 'RIRS · Ureteroscopy · PCNL',
    image: {
      url: 'https://plus.unsplash.com/premium_photo-1661627109539-69d7096ea354?auto=format&fit=crop&w=800&q=80',
      alt: 'Endoscopy unit',
    },
  },
  {
    label: 'Patient Care',
    sub: 'Post-operative follow-up',
    image: {
      url: 'https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?auto=format&fit=crop&w=800&q=80',
      alt: 'Post-operative patient care',
    },
  },
]

export const testimonials = [
  {
    quote: 'I was terrified of surgery. Dr. Aggarwal explained every step with a calm clarity I had never experienced with a doctor before. The RIRS procedure was over in an hour, and I was home the same evening.',
    name: 'Rajesh Kumar', location: 'Delhi NCR', condition: 'Kidney Stone — RIRS', initials: 'RK', stars: 5, consentOnRecord: true,
  },
  {
    quote: 'After two years of failed fertility treatments, a friend referred me to Dr. Aggarwal for a varicocele assessment. Within eight months of microsurgery, we had our first child. I cannot put that into words.',
    name: 'Arjun Mehta', location: 'Gurgaon', condition: 'Varicocele Microsurgery', initials: 'AM', stars: 5, consentOnRecord: true,
  },
  {
    quote: 'My father had an enlarged prostate that was affecting his sleep and quality of life for years. Dr. Aggarwal performed HoLEP and the transformation was remarkable. He is a different person now.',
    name: 'Priya Sharma', location: 'Noida', condition: 'HoLEP — Enlarged Prostate', initials: 'PS', stars: 5, consentOnRecord: true,
  },
  {
    quote: "Dr. Aggarwal coordinated my husband's living-donor kidney transplant with exceptional professionalism. The team, the surgery, the aftercare — every detail was handled with precision and warmth.",
    name: 'Sunita Verma', location: 'Faridabad', condition: 'Renal Transplantation', initials: 'SV', stars: 5, consentOnRecord: true,
  },
  {
    quote: 'I came in for a kidney tumour that three other doctors called inoperable. Dr. Aggarwal performed a partial nephrectomy laparoscopically. I kept my kidney. That is everything.',
    name: 'Vikram Singh', location: 'Chandigarh', condition: 'Partial Nephrectomy', initials: 'VS', stars: 5, consentOnRecord: true,
  },
]
