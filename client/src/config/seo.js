// TODO: replace with the real production domain once finalized, and update
// public/robots.txt + public/sitemap.xml (Sitemap/loc URLs) to match.
export const SITE_URL = 'https://drnamanaggarwal.com'
export const SITE_NAME = 'Dr. Naman Aggarwal — Urology, Andrology & Laparoscopic Surgery'

// hospital/addressLine/postalCode/geo were Manipal Hospital's exact building details —
// removed rather than left wrong now that the practice is framed around Men's Health
// Corner and Veena Nursing Home instead (see server/src/seed/data/practice.js, which
// has the same placeholder-until-confirmed treatment for the CMS-backed locations).
export const DOCTOR = {
  name: 'Dr. Naman Aggarwal',
  jobTitle: "Urologist, Kidney transplant surgeon and Men's health specialist",
  medicalSpecialty: ['Urology', 'Andrology', 'Laparoscopic Surgery'],
  addressLocality: 'Delhi',
  addressRegion: 'Delhi',
  addressCountry: 'IN',
  telephone: '+91-11-42888888',
  email: 'info@drnamanaggarwal.com',
  image: `${SITE_URL}/social-card.png`,
}
