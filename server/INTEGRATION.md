# Wiring the React frontend to the CMS

The client in `client/` still reads from its hard-coded modules
(`src/data/*.js`, and the `const` arrays inside components). The backend now
serves the exact same content from MongoDB, so switching over is mechanical.

Nothing in `client/` has been changed — this is the recipe for doing it, one
component at a time, with the site working throughout.

---

## 1. Point the client at the API

Nothing to configure. The site and the API share one origin — Vite proxies
`/api` to the backend in development, and Express serves the built site itself
in production — so a **relative `/api` path works in both**.

## 2. Add a tiny API layer

`client/src/lib/api.js`:

```js
const BASE = '/api'

export async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const { data } = await res.json()
  return data
}

export function post(path, body) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async res => {
    const json = await res.json()
    if (!res.ok) throw Object.assign(new Error(json.error?.message), { details: json.error?.details })
    return json.data
  })
}
```

## 3. Fetch the home page once, share it via context

The API is built around aggregate endpoints so the home page needs exactly one
request. `client/src/lib/ContentProvider.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { get } from './api'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [state, setState] = useState({ loading: true, site: null, home: null })

  useEffect(() => {
    Promise.all([get('/public/bootstrap'), get('/public/home')])
      .then(([site, home]) => setState({ loading: false, site, home }))
      .catch(error => setState({ loading: false, error }))
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)

/** Section headings, with a fallback so a missing record never blanks the page. */
export function useSection(key, fallback = {}) {
  const { site } = useContent()
  return site?.sections?.[key] || fallback
}
```

Wrap `<Shell/>` in `App.jsx` with `<ContentProvider>`.

## 4. Convert a component

Before — `components/Testimonials.jsx`:

```jsx
const TESTIMONIALS = [ /* 5 hard-coded objects */ ]
```

After:

```jsx
import { useContent, useSection } from '../lib/ContentProvider'

export default function Testimonials() {
  const { home } = useContent()
  const section = useSection('home-voices', { eyebrow: 'In Their Words', heading: 'Voices of <em>patients</em>' })
  const testimonials = home?.testimonials || []

  if (!testimonials.length) return null
  // …the rest of the component is unchanged, reading `testimonials` instead of TESTIMONIALS
}
```

Headings come back with `<em>` markup for the accent styling, so render them
with `dangerouslySetInnerHTML={{ __html: section.heading }}`.

## 5. Field mapping

The API deliberately keeps the shapes the components already expect.

| Component | Replace | With |
| --- | --- | --- |
| `Hero.jsx` | `WORDS` | `home.hero.headlineWords` |
| `Gallery.jsx` | `TREATMENTS` | `home.treatments` |
| `DoctorAdvice.jsx` | `CONDITIONS` | `home.conditions` |
| `Philosophy.jsx` | `CARDS` | `home.philosophy` |
| `Journey.jsx` | `ITEMS` | `home.journey` |
| `Research.jsx` | `TALKS` | `home.research` |
| `Reels.jsx` | `REELS` | `home.reels` |
| `PhotoGallery.jsx` | `CLINIC_PHOTOS` | `home.photos` |
| `Testimonials.jsx` | `TESTIMONIALS` | `home.testimonials` |
| `CredentialsMarquee.jsx` | inline `<Items/>` | `home.credentials` |
| `FAQ.jsx` | `FAQS` from `data/faqs.js` | `home.faqs` |
| `BlogPreview.jsx` | `BLOGS.filter(featured)` | `home.posts` |
| `Navbar.jsx` | `SECTION_LINKS`, `PAGE_LINKS` | `site.navigation.sectionLinks` / `.pageLinks` |
| `SectionRail.jsx` | `LINKS` | `site.navigation.railLinks` |
| `Footer.jsx` | inline columns + socials | `site.navigation.footerColumns`, `site.settings.social` |
| `App.jsx` | `WA_NUMBER`, `WA_MSG` | `site.settings.contact.whatsappNumber` / `.whatsappMessage` |
| `config/seo.js` | `SITE_URL`, `DOCTOR` | `site.settings.siteUrl`, `site.settings.doctor` |

**Two notes on shape changes:**

- **Icons are now SVG strings**, not JSX. Render them with
  `<span dangerouslySetInnerHTML={{ __html: item.icon }}/>`. The server
  sanitises SVG on save against an SVG-aware allow-list, and the markup keeps
  the `var(--crimson)` / `var(--blush)` custom properties, so the existing CSS
  still colours them.
- **`credentials`** is `{ emphasis, text }` per item; the original rendered
  `<b>{emphasis}</b> · {text}`.

## 6. Route-level pages

```jsx
// pages/TreatmentDetail.jsx
const { slug } = useParams()
const [treatment, setTreatment] = useState(null)
useEffect(() => {
  get(`/public/treatments/${slug}`).then(setTreatment).catch(() => setTreatment(false))
}, [slug])
// treatment === false → render the not-found state
```

The detail response already includes `related` (4 other treatments, or 3 other
posts), so no follow-up request is needed.

`pages/Contact.jsx` should use `GET /public/contact`, which returns the clinic
locations with their OPD schedules, fees, directions and map embed URLs.

## 7. Make the contact form real

The form currently just sets `sent = true` locally. Replace `handleSubmit`:

```jsx
const [error, setError] = useState(null)
const [sending, setSending] = useState(false)

const handleSubmit = async e => {
  e.preventDefault()
  setSending(true); setError(null)
  try {
    await post('/appointments', form)
    setSent(true)
  } catch (err) {
    setError(err.details ? Object.values(err.details)[0] : err.message)
  } finally {
    setSending(false)
  }
}
```

Add a hidden honeypot the server already checks — bots fill it, humans do not:

```jsx
<input
  type="text" name="website" tabIndex={-1} autoComplete="off"
  value={form.website || ''} onChange={handleChange}
  style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true"
/>
```

Submissions then appear under **Consultation Requests** in the CMS, and the
clinic gets an email if SMTP is configured.

## 8. SEO

`components/Seo.jsx` can take its defaults from `site.settings.seo`, and the
`Physician` JSON-LD block in `Home.jsx` can be replaced with a fetch of
`/api/seo/jsonld`, which is generated from the live settings and locations.

Point `public/robots.txt` and `public/sitemap.xml` at the generated versions,
or have your host proxy `/sitemap.xml` → `/api/seo/sitemap.xml` so newly
published articles appear without a redeploy.

## 9. Optional: analytics

One line in `ScrollToTop` gives you the traffic dashboard in the CMS:

```jsx
useEffect(() => {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: pathname, referrer: document.referrer }),
  }).catch(() => {})
}, [pathname])
```

---

## Suggested order

Do it in slices, verifying the site after each:

1. `ContentProvider` + `Navbar` / `Footer` / WhatsApp link
2. The contact form (immediate practical value — enquiries stop being lost)
3. Home-page collections (testimonials, reels, journey, research, photos)
4. Treatments and the treatment detail page
5. Blog list and post pages
6. SEO and analytics

If the API is unreachable, every converted component should fall back to
rendering nothing (`if (!items.length) return null`) rather than crashing, so a
backend outage degrades the site instead of breaking it.
