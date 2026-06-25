import './assets/styles.css'
import './assets/pages.css'
import './assets/console.css'
import './lib/image-slot.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
