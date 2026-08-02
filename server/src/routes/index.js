import { Router } from 'express'
import mongoose from 'mongoose'
import authRoutes from './auth.routes.js'
import cmsRoutes from './cms.routes.js'
import publicRoutes from './public.routes.js'
import mediaRoutes from './media.routes.js'
import appointmentRoutes from './appointments.routes.js'
import newsletterRoutes from './newsletter.routes.js'
import analyticsRoutes from './analytics.routes.js'
import seoRoutes from './seo.routes.js'
import { cacheStats } from '../services/cache.service.js'
import { ok } from '../utils/respond.js'

const router = Router()

router.get('/health', (_req, res) => ok(res, {
  status: 'ok',
  uptime: Math.round(process.uptime()),
  db: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  cache: cacheStats(),
  time: new Date().toISOString(),
}))

router.use('/auth', authRoutes)
router.use('/cms', cmsRoutes)              // authenticated CMS surface
router.use('/public', publicRoutes)        // read-only delivery API for the site
router.use('/media', mediaRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/newsletter', newsletterRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/seo', seoRoutes)

export default router
