import Seo from '../components/Seo'
import { SITE_URL, DOCTOR } from '../config/seo'
import { FAQS as FAQS_FALLBACK } from '../data/faqs'
import { useContent } from '../lib/ContentProvider'
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
import ClinicLocations from '../components/ClinicLocations'
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
    addressLocality: DOCTOR.addressLocality,
    addressRegion: DOCTOR.addressRegion,
    addressCountry: DOCTOR.addressCountry,
  },
}

export default function Home() {
  const { home } = useContent()
  const faqs = home?.faqs?.length ? home.faqs : FAQS_FALLBACK
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <Seo
        title="Urologist in Delhi"
        description="Dr. Naman Aggarwal — Consultant Urologist, Andrologist & Laparoscopic Surgeon, practising across Delhi at Men's Health Corner (main clinic), Manipal Hospital and Veena Nursing Home. MBBS, MS, MCh Urology. 11 years experience in kidney stones, HoLEP, male infertility & renal transplant."
        path="/"
        jsonLd={[PHYSICIAN_JSON_LD, faqJsonLd]}
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
      <ClinicLocations id="locations"/>
      <CTA/>
      <SectionRail/>
    </>
  )
}
