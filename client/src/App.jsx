import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useScrollProgress } from './hooks/useScrollProgress'
import { useCursor } from './hooks/useCursor'
import KidneySymbol from './components/KidneySymbol'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import VitalBar from './components/VitalBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import BlogPage from './pages/Blog'
import BlogPostPage from './pages/BlogPost'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Shell() {
  useScrollProgress()
  useCursor()
  return (
    <>
      <KidneySymbol/>
      <Preloader/>
      <Cursor/>
      <VitalBar/>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/contact" element={<ContactPage/>}/>
        <Route path="/blog" element={<BlogPage/>}/>
        <Route path="/blog/:slug" element={<BlogPostPage/>}/>
      </Routes>
      <Footer/>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop/>
      <Shell/>
    </BrowserRouter>
  )
}
