import { connectDB, disconnectDB } from '../config/db.js'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { assertPasswordStrength } from '../services/auth.service.js'
import { logger } from '../config/logger.js'

/**
 * Creates (or resets) the bootstrap admin account from ADMIN_* env vars.
 * Safe to re-run: an existing account is updated rather than duplicated.
 */
async function run() {
  await connectDB()

  const email = env.admin.email.toLowerCase()
  assertPasswordStrength(env.admin.password)

  let user = await User.findOne({ email }).select('+passwordHash')

  if (user) {
    await user.setPassword(env.admin.password)
    user.role = 'admin'
    user.active = true
    await user.save()
    logger.info(`Reset password for existing admin: ${email}`)
  } else {
    user = new User({ name: env.admin.name, email, role: 'admin' })
    await user.setPassword(env.admin.password)
    await user.save()
    logger.info(`Created admin: ${email}`)
  }

  logger.info('Sign in at /admin — change this password immediately after your first login.')
  await disconnectDB()
}

run().catch(async err => {
  logger.error(err.message)
  await disconnectDB().catch(() => {})
  process.exit(1)
})
