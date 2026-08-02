import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env } from './config/env.js'
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

  app.use('/api', apiLimiter, routes)

  // Also mount the SEO router at the root, so crawlers find /sitemap.xml and
  // /robots.txt at their conventional paths without a redirect.
  app.use('/', seoRoutes)

  // This service is an API only — the public site and the CMS are both part of
  // the frontend and are deployed separately. Root returns a short service
  // descriptor so hitting the bare URL is informative rather than a 404.
  app.get('/', (_req, res) => res.json({
    service: 'Dr. Naman Aggarwal — API',
    status: 'ok',
    docs: {
      health: '/api/health',
      publicContent: '/api/public/home',
      cms: '/api/cms/schema',
    },
  }))

  app.use(notFound)
  app.use(errorHandler)

  return app
}
