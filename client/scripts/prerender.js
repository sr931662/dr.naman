/**
 * Build-time prerendering (SSG).
 *
 * This site is a client-rendered React SPA. Without this step, every route but "/"
 * ships crawlers and link-preview bots (WhatsApp, Facebook, X, LinkedIn — none of
 * which execute JS) the same generic homepage tags baked into index.html, and real
 * page content only exists after React mounts. Search engines that DO run JS (Google)
 * still index it eventually, but slower and less reliably than static HTML.
 *
 * Runs after `vite build`. For every route it renders <Shell/> (the router-independent
 * part of <App/>) via react-dom/server inside a StaticRouter, captures the per-route
 * <title>/meta/canonical/OG/Twitter/JSON-LD that each page's <Seo/> component (via
 * react-helmet-async) would normally only produce in the browser, and writes a real
 * dist/<route>/index.html carrying them — plus the page's actual rendered markup, so
 * text content and internal links are crawlable without JS too.
 *
 * Uses Vite's ssrLoadModule (dev-transform pipeline) rather than a separate SSR bundle,
 * so JSX and CSS-module imports resolve exactly as they do in the app, without a second
 * build target. The one tradeoff: image `src` attributes inside the prerendered HTML
 * point at dev-relative asset paths, not the hashed production URLs — cosmetically
 * wrong for the fraction of a second before client JS mounts and replaces them (main.jsx
 * uses createRoot, not hydrateRoot, so this is a clean replace, not a hydration
 * mismatch). Head tags, text content, and links are unaffected and fully correct.
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
  const { BLOGS } = await vite.ssrLoadModule('/src/data/blogs.js')
  const { TREATMENTS } = await vite.ssrLoadModule('/src/components/Gallery.jsx')

  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.9', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    ...BLOGS.map(b => ({ path: `/blog/${b.slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...TREATMENTS.map(t => ({ path: `/treatments/${t.slug}`, priority: '0.9', changefreq: 'monthly' })),
  ]

  let ok = 0, fallback = 0
  for (const route of routes) {
    const result = renderRoute(route.path, Shell)
    writeRoute(route.path, result, template)
    if (result.rendered) ok++
    else fallback++
  }
  console.log(`[prerender] ${routes.length} routes: ${ok} fully rendered, ${fallback} head-only fallback.`)

  writeSitemapAndRobots(routes, SITE_URL)

  await vite.close()
}

function renderRoute(routePath, Shell) {
  const helmetContext = {}
  try {
    const rawHtml = renderToString(
      React.createElement(
        HelmetProvider,
        { context: helmetContext },
        React.createElement(StaticRouter, { location: routePath }, React.createElement(Shell)),
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
