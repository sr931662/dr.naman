import path from 'node:path'
import { existsSync } from 'node:fs'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env, ROOT_DIR } from './config/env.js'
import { logger } from './config/logger.js'
import routes from './routes/index.js'
import seoRoutes from './routes/seo.routes.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { notFound, errorHandler } from './middleware/error.js'
import { ApiError } from './utils/ApiError.js'

export function createApp() {
  const app = express()

  // Behind nginx/Heroku/Render, trust the proxy so req.ip and secure cookies work.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet({
    // This origin serves three things — the public React site, the admin UI and
    // the API — so the policy has to cover all of them.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Both SPAs inject inline styles at runtime (framer-motion animations,
        // the admin's dynamic style attributes).
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        // Remote clinic photography (Unsplash) and data:/blob: previews.
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", ...env.corsOrigins],
        fontSrc: ["'self'", 'data:'],
        // The contact page embeds a Google Maps iframe.
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))

  app.use(cors({
    origin(origin, cb) {
      // Same-origin/server-to-server requests arrive without an Origin header.
      if (!origin) return cb(null, true)
      if (env.corsOrigins.includes(origin) || !env.isProd) return cb(null, true)
      cb(ApiError.forbidden(`Origin ${origin} is not allowed`))
    },
    credentials: true,
  }))

  app.use(compression())
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))
  app.use(cookieParser())

  if (!env.isProd) {
    app.use(morgan('dev', { stream: { write: m => logger.debug(m.trim()) } }))
  } else {
    app.use(morgan('combined', { stream: { write: m => logger.info(m.trim()) } }))
  }

  // Uploaded media, served with a long cache since filenames are content-hashed.
  app.use('/uploads', express.static(env.uploads.dir, {
    maxAge: '30d',
    immutable: true,
    fallthrough: true,
  }))

  // The CMS admin UI — a no-build single page app.
  app.use('/admin', express.static(path.join(ROOT_DIR, 'public/admin')))
  app.get('/admin/*', (_req, res) => res.sendFile(path.join(ROOT_DIR, 'public/admin/index.html')))

  app.use('/api', apiLimiter, routes)

  // Also mount the SEO router at the root, so crawlers find /sitemap.xml and
  // /robots.txt at their conventional paths without a redirect.
  app.use('/', seoRoutes)

  // ── The public React site, on this same origin ───────────────────────────
  //
  // Serving `client/dist` from here means the site, the CMS and the API all
  // share one domain: no CORS, no cross-site cookie rules, and one thing to
  // deploy. Everything above this point has already claimed its paths, so the
  // catch-all below only ever sees genuine front-end routes.
  const clientDist = path.resolve(ROOT_DIR, '..', 'client', 'dist')
  const hasClientBuild = existsSync(path.join(clientDist, 'index.html'))

  if (hasClientBuild) {
    // Hashed filenames, so assets can be cached hard; index.html must not be.
    app.use(express.static(clientDist, {
      index: false,
      maxAge: '30d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache')
      },
    }))

    app.get('*', (req, res, next) => {
      // Reserved prefixes must 404 as JSON, not silently return the SPA shell —
      // a mistyped API path returning HTML is a miserable thing to debug.
      if (RESERVED.some(prefix => req.path.startsWith(prefix))) return next()
      res.sendFile(path.join(clientDist, 'index.html'))
    })
  } else {
    logger.warn(`No client build found at ${clientDist} — run "npm run build" in client/`)
    logger.warn('Until then the public site is only served by the Vite dev server.')
    app.get('/', (_req, res) => res.redirect('/admin'))
  }

  app.use(notFound)
  app.use(errorHandler)

  return app
}

/** Paths owned by the backend, which the SPA catch-all must never swallow. */
const RESERVED = ['/api', '/admin', '/uploads', '/sitemap.xml', '/robots.txt', '/jsonld']
