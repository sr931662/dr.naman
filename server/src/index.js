import { createApp } from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env, assertProductionConfig } from './config/env.js'
import { logger } from './config/logger.js'
import { ensureUploadDir } from './services/media.service.js'

async function main() {
  assertProductionConfig()

  await connectDB()
  await ensureUploadDir()

  const app = createApp()
  const server = app.listen(env.port, () => {
    logger.info(`API      → http://localhost:${env.port}/api`)
    logger.info(`CMS      → http://localhost:${env.port}/admin`)
    logger.info(`Health   → http://localhost:${env.port}/api/health`)
    logger.info(`Env      → ${env.nodeEnv}`)
  })

  const shutdown = async signal => {
    logger.info(`${signal} received — shutting down`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
    // Don't hang forever on a stuck connection.
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('unhandledRejection', reason => logger.error('Unhandled rejection:', reason))
  process.on('uncaughtException', err => {
    logger.error('Uncaught exception:', err)
    process.exit(1)
  })
}

main().catch(err => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})
