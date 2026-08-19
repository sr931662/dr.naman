import { connectDB, disconnectDB } from '../config/db.js'
import { logger } from '../config/logger.js'
import * as content from '../services/content.service.js'

/**
 * One-off fix for the live `locations` collection: makes sure Men's Health
 * Corner exists as the primary clinic, demotes Manipal Hospital from
 * primary to secondary (he also consults there, it isn't his main clinic),
 * and labels Veena Nursing Home as his own hospital. Safe to re-run.
 */
async function run() {
  await connectDB()

  const { items } = await content.list('locations', { limit: 50 })
  logger.info('Current locations:')
  for (const l of items) logger.info(`  - ${l.name} [kind=${l.kind}, badgeLabel=${l.badgeLabel || '(none)'}]`)

  const mhc = items.find(l => /men'?s health corner/i.test(l.name))
  const manipal = items.find(l => /manipal/i.test(l.name))
  const veena = items.find(l => /veena/i.test(l.name))

  if (!mhc) {
    logger.info('Creating Men\'s Health Corner as the primary clinic…')
    await content.create('locations', {
      name: "Men's Health Corner",
      kind: 'primary',
      badgeLabel: "Dr. Aggarwal's Clinic",
      addressLine: 'Address to be confirmed',
      city: 'Delhi',
      teleconsultation: true,
      schedule: [{ days: 'Add via CMS', hours: 'Hours to be confirmed', note: '' }],
      status: 'published',
      order: -1,
    })
  } else if (mhc.kind !== 'primary') {
    logger.info("Fixing Men's Health Corner kind -> primary…")
    await content.update('locations', mhc._id, { kind: 'primary', badgeLabel: mhc.badgeLabel || "Dr. Aggarwal's Clinic" })
  } else {
    logger.info("Men's Health Corner already primary — leaving as-is.")
  }

  if (manipal && manipal.kind === 'primary') {
    logger.info('Demoting Manipal Hospital from primary -> secondary…')
    await content.update('locations', manipal._id, { kind: 'secondary', badgeLabel: manipal.badgeLabel || 'Also Consults Here' })
  } else if (manipal) {
    logger.info(`Manipal Hospital already kind=${manipal.kind} — leaving as-is.`)
  } else {
    logger.warn('No Manipal Hospital record found — nothing to demote.')
  }

  if (veena && !veena.badgeLabel) {
    logger.info('Labelling Veena Nursing Home as "His Own Hospital"…')
    await content.update('locations', veena._id, { badgeLabel: 'His Own Hospital' })
  } else if (veena) {
    logger.info(`Veena Nursing Home already has badgeLabel="${veena.badgeLabel}" — leaving as-is.`)
  } else {
    logger.warn('No Veena Nursing Home record found.')
  }

  const after = await content.list('locations', { limit: 50, sort: 'order' })
  logger.info('Final locations:')
  for (const l of after.items) logger.info(`  - ${l.name} [kind=${l.kind}, badgeLabel=${l.badgeLabel || '(none)'}, order=${l.order}]`)

  await disconnectDB()
}

run().catch(async err => {
  logger.error(err.message)
  await disconnectDB().catch(() => {})
  process.exit(1)
})
