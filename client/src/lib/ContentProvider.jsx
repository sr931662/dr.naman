import { createContext, useContext, useEffect, useState } from 'react'
import { getBootstrap, getHome } from './api'

const ContentContext = createContext(null)

/**
 * Fetches the site-wide bootstrap (`nav`/`settings`/section copy) and the
 * home-page aggregate once, and shares them with every component below via
 * context — one round trip instead of one per section.
 *
 * `initialState` lets the build-time prerender script (scripts/prerender.js)
 * seed this with data it already fetched server-side, so the SSR pass renders
 * real content instead of the loading state. In the browser this is left
 * undefined and the effect below fetches normally.
 */
export function ContentProvider({ children, initialState }) {
  const [state, setState] = useState(initialState || { loading: true, site: null, home: null, error: null })

  useEffect(() => {
    if (initialState) return // already seeded (prerendered) — no need to refetch
    let cancelled = false
    Promise.all([getBootstrap(), getHome()])
      .then(([site, home]) => { if (!cancelled) setState({ loading: false, site, home, error: null }) })
      .catch(error => { if (!cancelled) setState({ loading: false, site: null, home: null, error }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext) || { loading: true, site: null, home: null, error: null }

/** Section headings, with a fallback so a missing record never blanks the page. */
export function useSection(key, fallback = {}) {
  const { site } = useContent()
  return site?.sections?.[key] || fallback
}
