import KidneySymbol from './components/KidneySymbol'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import VitalBar from './components/VitalBar'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CredentialsMarquee from './components/CredentialsMarquee'
import LivingAtlasConsole from './components/LivingAtlasConsole'
import Philosophy from './components/Philosophy'
import Journey from './components/Journey'
import Research from './components/Research'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import SectionRail from './components/SectionRail'
import { useScrollProgress } from './hooks/useScrollProgress'
import { useCursor } from './hooks/useCursor'

export default function App() {
  useScrollProgress()
  useCursor()
  return (
    <>
      <KidneySymbol/>
      <Preloader/>
      <Cursor/>
      <VitalBar/>
      <Navbar/>
      <Hero/>
      <CredentialsMarquee/>
      <LivingAtlasConsole/>
      <Philosophy/>
      <Journey/>
      <Research/>
      <Testimonials/>
      <CTA/>
      <Footer/>
      <SectionRail/>
    </>
  )
}
