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

export default function Home() {
  return (
    <>
      <Hero/>
      <CredentialsMarquee/>
      <PhotoGallery/>
      <Gallery/>
      <LivingAtlasConsole/>
      <DoctorAdvice/>
      <Philosophy/>
      <Journey/>
      <Research/>
      <Reels/>
      <Testimonials/>
      <BlogPreview/>
      <FAQ/>
      <CTA/>
      <SectionRail/>
    </>
  )
}
