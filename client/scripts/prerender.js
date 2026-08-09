/**
 * Build-time prerendering (SSG).
 *
 * This site is a client-rendered React SPA whose content is now CMS-driven (see
 * server/INTEGRATION.md) — every component fetches from /api/public/* at runtime via
 * ContentProvider. Without this step, every route but "/" would still ship crawlers
 * and link-preview bots (WhatsApp, Facebook, X, LinkedIn — none of which execute JS)
 * the same generic homepage tags baked into index.html, and no page content would
 * exist until React mounts and its data fetch resolves.
 *
 * Runs after `vite build`. For every route it:
 *   1. Fetches the live site/home data (and, for /blog/:slug and /treatments/:slug,
 *      that specific record) from the real backend, so the prerendered HTML matches
 *      what's actually published in the CMS right now.
 *   2. Seeds <ContentProvider> with that data via Shell's `initialContent` prop, so
 *      the SSR render (react-dom/server) produces fully populated markup instead of
 *      each component's loading/empty state — components normally fetch in a
 *      useEffect, which never runs during renderToString.
 *   3. Captures the per-route <title>/meta/canonical/OG/Twitter/JSON-LD each page's
 *      <Seo/> component (via react-helmet-async) produces, and writes a real
 *      dist/<route>/index.html carrying them plus the rendered markup.
 *
 * If the backend is unreachable at build time (VITE_API_URL not set to an absolute
 * URL, or the fetch fails), the whole live-data step is skipped and every route
 * prerenders from the same hardcoded fallback content each component already ships
 * for this exact scenario — the build never fails because of it, it just produces a
 * slightly less current (but still fully populated) site.
 *
 * Uses Vite's ssrLoadModule (dev-transform pipeline) rather than a separate SSR bundle,
 * so JSX and CSS-module imports resolve exactly as they do in the app, without a second
 * build target. The one tradeoff: image `src` attributes inside the prerendered HTML
 * point at dev-relative asset paths, not the hashed production URLs — cosmetically
 * wrong for the fraction of a second before client JS mounts and replaces them (main.jsx
 * uses createRoot, not hydrateRoot, so this is a clean replace, not a hydration
 * mismatch). Head tags, text content, and links are unaffected and fully correct.
 *
 * Note: the browser itself always refetches live data on mount (Shell gets no
 * `initialContent` there) rather than reading back what was baked in here, so a real
 * visitor briefly sees the loading/fallback state before their own fetch resolves —
 * same flash that already exists from createRoot replacing the prerendered DOM.
 * Avoiding that would mean embedding the fetched data as a `window.__INITIAL_DATA__`
 * script and having ContentProvider read it — a reasonable follow-up, not done here.
 *
 * If a route's component tree throws during SSR, that route falls back to the
 * unmodified template — the build never fails because of it, it just loses the
 * head-tag/content upgrade for that one route.
 *
 * Note on react-helmet-async + React 19: react-helmet-async v3 detects React 19 and,
 * instead of collecting tags into the HelmetProvider context (the pre-19 mechanism this
 * script would otherwise read), renders <title>/<meta>/<link>/<script> literally inline
 * wherever <Helmet> sits in the tree — relying on React 19's built-in head-hoisting,
 * which only runs in the browser reconciler / streaming SSR, not in renderToString. So
 * here they come out inline in bodyHtml instead of hoisted to <head>. HOISTABLE_RE below
 * pulls them back out of the rendered string and moves them into <head> itself.
 */
import { createServer } from 'vite'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { HelmetProvider } from 'react-helmet-async'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HOISTABLE_RE = /<title>[\s\S]*?<\/title>|<meta\b[^>]*\/>|<link\b[^>]*\/>|<script\b[^>]*>[\s\S]*?<\/script>/g

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(clientRoot, 'dist')
const templatePath = path.join(dist, 'index.html')

async function main() {
  if (!fs.existsSync(templatePath)) {
    console.error('[prerender] dist/index.html not found — run `vite build` first.')
    process.exit(1)
  }
  const template = fs.readFileSync(templatePath, 'utf-8')

  const vite = await createServer({
    root: clientRoot,
    server: { middlewareMode: true },
    appType: 'custom',
  })

  const { Shell } = await vite.ssrLoadModule('/src/App.jsx')
  const { SITE_URL } = await vite.ssrLoadModule('/src/config/seo.js')
  const api = await vite.ssrLoadModule('/src/lib/api.js')

  const live = await fetchLiveContent(api)

  const routes = live
    ? await buildLiveRoutes(live)
    : await buildFallbackRoutes(vite)

  let ok = 0, fallback = 0
  for (const route of routes) {
    const initialContent = live ? initialContentFor(route.path, live) : undefined
    const result = renderRoute(route.path, Shell, initialContent)
    writeRoute(route.path, result, template)
    if (result.rendered) ok++
    else fallback++
  }
  console.log(`[prerender] ${routes.length} routes (${live ? 'live CMS data' : 'static fallback data'}): ${ok} fully rendered, ${fallback} head-only fallback.`)

  writeSitemapAndRobots(routes, SITE_URL)

  await vite.close()
}

/**
 * Pulls everything prerendering needs from the real backend: the site-wide
 * bootstrap, the home aggregate, the full post list, and — one request each — the
 * full detail doc for every treatment and post so their /treatments/:slug and
 * /blog/:slug pages can render completely too. Returns null (triggering the static
 * fallback path for every route) if the backend isn't reachable at build time.
 */
async function fetchLiveContent(api) {
  if (!/^https?:\/\//.test(api.API_BASE)) {
    console.warn(
      `[prerender] VITE_API_URL is not an absolute URL (resolved to "${api.API_BASE}") — ` +
      'a Node build script has no page origin to resolve a relative path against, so live ' +
      'CMS content can\'t be fetched here. Set VITE_API_URL to a reachable absolute backend ' +
      'URL (e.g. http://localhost:5000/api) to prerender with real content; falling back to ' +
      'each component\'s static fallback content for this build.'
    )
    return null
  }

  try {
    const [site, home, posts] = await Promise.all([api.getBootstrap(), api.getHome(), api.getPosts()])

    const treatmentSlugs = (home.treatments || []).map(t => t.slug)
    const postSlugs = (posts || []).map(p => p.slug)

    const [treatmentEntries, postEntries] = await Promise.all([
      Promise.all(treatmentSlugs.map(async slug => {
        try { return [slug, await api.getTreatment(slug)] } catch { return [slug, null] }
      })),
      Promise.all(postSlugs.map(async slug => {
        try { return [slug, await api.getPost(slug)] } catch { return [slug, null] }
      })),
    ])

    return {
      site,
      home,
      posts,
      treatments: Object.fromEntries(treatmentEntries.filter(([, doc]) => doc)),
      postDetails: Object.fromEntries(postEntries.filter(([, doc]) => doc)),
    }
  } catch (err) {
    console.warn(`[prerender] live CMS fetch failed (${err.message}) — falling back to static content for every route.`)
    return null
  }
}

async function buildLiveRoutes(live) {
  return [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.9', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    ...live.posts.map(p => ({ path: `/blog/${p.slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...live.home.treatments.map(t => ({ path: `/treatments/${t.slug}`, priority: '0.9', changefreq: 'monthly' })),
  ]
}

async function buildFallbackRoutes(vite) {
  const { BLOGS } = await vite.ssrLoadModule('/src/data/blogs.js')
  const { TREATMENTS_FALLBACK } = await vite.ssrLoadModule('/src/components/Gallery.jsx')
  return [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.9', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    ...BLOGS.map(b => ({ path: `/blog/${b.slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...TREATMENTS_FALLBACK.map(t => ({ path: `/treatments/${t.slug}`, priority: '0.9', changefreq: 'monthly' })),
  ]
}

/** The initialState ContentProvider (and, for detail routes, BlogPost/TreatmentDetail) gets seeded with for this specific route. */
function initialContentFor(routePath, live) {
  const routeData = { posts: {}, treatments: {} }

  const postMatch = routePath.match(/^\/blog\/(.+)$/)
  if (postMatch && live.postDetails[postMatch[1]]) routeData.posts[postMatch[1]] = live.postDetails[postMatch[1]]

  const treatmentMatch = routePath.match(/^\/treatments\/(.+)$/)
  if (treatmentMatch && live.treatments[treatmentMatch[1]]) routeData.treatments[treatmentMatch[1]] = live.treatments[treatmentMatch[1]]

  return { loading: false, site: live.site, home: live.home, error: null, routeData }
}

function renderRoute(routePath, Shell, initialContent) {
  const helmetContext = {}
  try {
    const rawHtml = renderToString(
      React.createElement(
        HelmetProvider,
        { context: helmetContext },
        React.createElement(StaticRouter, { location: routePath }, React.createElement(Shell, { initialContent })),
      ),
    )
    // React 19 also auto-injects resource hints (e.g. <link rel="preload"> for a high
    // fetchPriority <img>) alongside Helmet's tags. Useful in the browser, but here the
    // href is a dev-server-relative asset path (see file header note) rather than the
    // hashed production one, so it would just be a dead preload — drop it.
    const headTags = (rawHtml.match(HOISTABLE_RE) || [])
      .filter(tag => !tag.includes('/src/assets/') && !tag.includes('/@fs/'))
      .join('\n')
    const bodyHtml = rawHtml.replace(HOISTABLE_RE, '')
    return { rendered: true, bodyHtml, headTags }
  } catch (err) {
    console.warn(`[prerender] ${routePath}: full render failed, using head-only fallback — ${err.message}`)
    return { rendered: false, bodyHtml: null, headTags: '' }
  }
}

function writeRoute(routePath, { bodyHtml, headTags }, template) {
  let html = template

  if (headTags) {
    html = html.replace(/<!-- SEO:START[\s\S]*?SEO:END -->/, headTags)
  }

  if (bodyHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)
  }

  const outDir = routePath === '/' ? dist : path.join(dist, routePath.replace(/^\//, ''))
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)
}

function writeSitemapAndRobots(routes, siteUrl) {
  const base = siteUrl.replace(/\/$/, '')
  const urls = routes.map(r => [
    '  <url>',
    `    <loc>${base}${r.path}</loc>`,
    r.changefreq ? `    <changefreq>${r.changefreq}</changefreq>` : '',
    r.priority ? `    <priority>${r.priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n'))

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)

  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n')
  fs.writeFileSync(path.join(dist, 'robots.txt'), robots)

  console.log(`[prerender] wrote dist/sitemap.xml (${routes.length} urls) and dist/robots.txt`)
}

main().catch(err => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
