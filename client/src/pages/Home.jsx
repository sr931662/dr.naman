import Seo from '../components/Seo'
import { SITE_URL, DOCTOR } from '../config/seo'
import { FAQS } from '../data/faqs'
import Hero from '../components/Hero'
import CredentialsMarquee from '../components/CredentialsMarquee'
import Gallery from '../components/Gallery'
import LivingAtlasConsole from '../components/LivingAtlasConsole'
import DoctorAdvice from '../components/DoctorAdvice'
import Philosophy from '../components/Philosophy'
import Journey from '../components/Journey'
import Research from '../components/Research'
import Reels from '../components/Reels'
import Testimonials from '../components/Testimonials'
import PhotoGallery from '../components/PhotoGallery'
import BlogPreview from '../components/BlogPreview'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import SectionRail from '../components/SectionRail'

const PHYSICIAN_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: DOCTOR.name,
  jobTitle: DOCTOR.jobTitle,
  medicalSpecialty: DOCTOR.medicalSpecialty,
  url: SITE_URL,
  image: DOCTOR.image,
  telephone: DOCTOR.telephone,
  email: DOCTOR.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: DOCTOR.addressLine,
    addressLocality: DOCTOR.addressLocality,
    addressRegion: DOCTOR.addressRegion,
    postalCode: DOCTOR.postalCode,
    addressCountry: DOCTOR.addressCountry,
  },
  worksFor: {
    '@type': 'Hospital',
    name: DOCTOR.hospital,
  },
}

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function Home() {
  return (
    <>
      <Seo
        title="Urologist in Dwarka, Delhi"
        description="Dr. Naman Aggarwal — Consultant Urologist, Andrologist & Laparoscopic Surgeon at Manipal Hospital, Dwarka, Delhi. MBBS, MS, MCh Urology. 11 years experience in kidney stones, HoLEP, male infertility & renal transplant."
        path="/"
        jsonLd={[PHYSICIAN_JSON_LD, FAQ_JSON_LD]}
      />
      <Hero/>
      <Gallery/>
      <DoctorAdvice/>
      <LivingAtlasConsole/>
      <Reels/>
      <PhotoGallery/>
      <CredentialsMarquee/>
      <Philosophy/>
      <Journey/>
      <Research/>
      <Testimonials/>
      <BlogPreview/>
      <FAQ/>
      <CTA/>
      <SectionRail/>
    </>
  )
}
